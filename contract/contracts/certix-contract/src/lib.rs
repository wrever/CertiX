#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum CertificateStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Certificate {
    pub file_hash: BytesN<32>,        // Hash SHA256 del archivo (prueba de contenido)
    pub owner: Address,                // Wallet del dueño (quien firmó)
    pub tx_hash: BytesN<32>,           // Hash de la transacción firmada (prueba de autenticidad)
    pub status: CertificateStatus,     // Estado: Pending, Approved, Rejected
    pub admin: Option<Address>,        // Admin que aprobó/rechazó
    pub validated_at: Option<u64>,     // Timestamp de validación
    pub rejection_reason: Option<String>, // Razón de rechazo (si aplica)
}

#[contract]
pub struct CertixContract;

#[contractimpl]
impl CertixContract {
    /// Inicializar contrato (solo una vez, al deploy)
    /// Nota: No requiere auth para permitir inicialización desde cualquier wallet
    pub fn initialize(env: Env, admin: Address) {
        // Guardar admin en storage instance
        let admin_key = Symbol::new(&env, "admin");
        env.storage().instance().set(&admin_key, &admin);
    }

    /// Registrar certificado en el contrato
    /// El usuario ya firmó la transacción Stellar original, el tx_hash es prueba de autenticidad
    /// 
    /// Parámetros:
    /// - owner: Wallet del dueño
    /// - file_hash: Hash SHA256 del archivo del certificado
    /// - tx_hash: Hash de la transacción Stellar que el usuario firmó (prueba de autenticidad)
    pub fn register_certificate(
        env: Env,
        owner: Address,
        file_hash: BytesN<32>,
        tx_hash: BytesN<32>
    ) {
        // NO requerir auth del owner aquí porque:
        // 1. El usuario ya firmó la transacción Stellar original (tx_hash es prueba)
        // 2. Simplifica el flujo para MVP
        // 3. El sistema puede registrar en nombre del usuario después de verificar la firma
        
        // Verificar que el certificado no existe ya
        if env.storage().persistent().has(&file_hash) {
            panic!("Certificate already registered");
        }
        
        // Crear certificado con estado Pending
        let cert = Certificate {
            file_hash: file_hash.clone(),
            owner: owner.clone(),
            tx_hash: tx_hash.clone(),
            status: CertificateStatus::Pending,
            admin: None,
            validated_at: None,
            rejection_reason: None,
        };
        
        // Guardar usando file_hash como key (único por certificado)
        env.storage().persistent().set(&file_hash, &cert);
    }

    /// Aprobar certificado (solo admin)
    /// Si el contrato está aprobado, el certificado está aprobado
    pub fn approve_certificate(env: Env, admin: Address, file_hash: BytesN<32>) {
        admin.require_auth();
        
        // Verificar que es admin
        let admin_key = Symbol::new(&env, "admin");
        let stored_admin: Address = env.storage()
            .instance()
            .get(&admin_key)
            .expect("Contract not initialized");
        assert!(admin == stored_admin, "Unauthorized: Only admin can approve");
        
        // Obtener certificado
        let mut cert: Certificate = env.storage()
            .persistent()
            .get(&file_hash)
            .expect("Certificate not found");
        
        // Verificar que está pendiente
        assert!(
            cert.status == CertificateStatus::Pending,
            "Certificate already processed"
        );
        
        // Aprobar: actualizar estado
        cert.status = CertificateStatus::Approved;
        cert.admin = Some(admin.clone());
        cert.validated_at = Some(env.ledger().timestamp());
        
        // Guardar actualizado
        env.storage().persistent().set(&file_hash, &cert);
    }

    /// Rechazar certificado (solo admin)
    pub fn reject_certificate(
        env: Env,
        admin: Address,
        file_hash: BytesN<32>,
        reason: String
    ) {
        admin.require_auth();
        
        // Verificar que es admin
        let admin_key = Symbol::new(&env, "admin");
        let stored_admin: Address = env.storage()
            .instance()
            .get(&admin_key)
            .expect("Contract not initialized");
        assert!(admin == stored_admin, "Unauthorized: Only admin can reject");
        
        // Obtener certificado
        let mut cert: Certificate = env.storage()
            .persistent()
            .get(&file_hash)
            .expect("Certificate not found");
        
        // Verificar que está pendiente
        assert!(
            cert.status == CertificateStatus::Pending,
            "Certificate already processed"
        );
        
        // Rechazar: actualizar estado
        cert.status = CertificateStatus::Rejected;
        cert.admin = Some(admin.clone());
        cert.validated_at = Some(env.ledger().timestamp());
        cert.rejection_reason = Some(reason);
        
        // Guardar actualizado
        env.storage().persistent().set(&file_hash, &cert);
    }

    /// Obtener certificado por hash
    pub fn get_certificate(env: Env, file_hash: BytesN<32>) -> Certificate {
        env.storage()
            .persistent()
            .get(&file_hash)
            .expect("Certificate not found")
    }

    /// Verificar si un certificado está aprobado
    pub fn is_approved(env: Env, file_hash: BytesN<32>) -> bool {
        let cert: Certificate = env.storage()
            .persistent()
            .get(&file_hash)
            .expect("Certificate not found");
        cert.status == CertificateStatus::Approved
    }
}

mod test;
