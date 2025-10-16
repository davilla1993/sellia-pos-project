package com.follysitou.sellia_backend.util;

public class ErrorMessages {

    // Authentification
    public static final String TOKEN_MISSING = "Authentification requise. Veuillez vous connecter avec vos identifiants.";
    public static final String TOKEN_INVALID = "Votre session a expiré. Veuillez vous reconnecter.";
    public static final String TOKEN_EXPIRED = "Votre session a expiré. Veuillez vous reconnecter.";
    public static final String CREDENTIALS_INVALID = "Nom d'utilisateur ou mot de passe incorrect.";
    public static final String ACCOUNT_DISABLED = "Votre compte est désactivé. Contactez l'administrateur.";

    // Autorisation
    public static final String ACCESS_DENIED = "Vous n'avez pas la permission d'accéder à cette ressource.";
    public static final String ADMIN_REQUIRED = "Seuls les administrateurs peuvent accéder à cette ressource.";
    public static final String ROLE_REQUIRED = "Vous n'avez pas le rôle requis pour effectuer cette action.";

    // Ressources
    public static final String RESOURCE_NOT_FOUND = "La ressource demandée n'existe pas.";
    public static final String USER_NOT_FOUND = "Utilisateur introuvable.";
    public static final String ROLE_NOT_FOUND = "Rôle introuvable.";
    public static final String CATEGORY_NOT_FOUND = "Catégorie introuvable.";
    public static final String PRODUCT_NOT_FOUND = "Produit introuvable.";
    public static final String MENU_NOT_FOUND = "Menu introuvable.";
    public static final String TABLE_NOT_FOUND = "Table introuvable.";
    public static final String ORDER_NOT_FOUND = "Commande introuvable.";

    // Conflits
    public static final String USERNAME_ALREADY_EXISTS = "Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.";
    public static final String EMAIL_ALREADY_EXISTS = "Cet email est déjà utilisé. Veuillez en choisir un autre.";
    public static final String RESOURCE_ALREADY_EXISTS = "Cette ressource existe déjà.";
    public static final String DUPLICATE_ENTRY = "Cette entrée existe déjà.";

    // Validation
    public static final String INVALID_INPUT = "Les données fournies sont invalides.";
    public static final String PASSWORD_INVALID = "Le mot de passe doit contenir au moins 6 caractères, une majuscule, un chiffre et un caractère spécial.";
    public static final String PASSWORD_MISMATCH = "Les mots de passe ne correspondent pas.";
    public static final String CURRENT_PASSWORD_INCORRECT = "Le mot de passe actuel est incorrect.";
    public static final String EMPTY_FIELD = "Ce champ est obligatoire.";

    // Opérations
    public static final String OPERATION_FAILED = "L'opération n'a pas pu être complétée. Veuillez réessayer.";
    public static final String DELETE_FAILED = "La suppression a échoué. Vérifiez que la ressource existe.";
    public static final String UPDATE_FAILED = "La mise à jour a échoué. Vérifiez les données fournies.";
    public static final String CREATE_FAILED = "La création a échoué. Vérifiez les données fournies.";

    // Métier
    public static final String USER_INACTIVE = "Ce compte est inactif.";
    public static final String INSUFFICIENT_PERMISSIONS = "Vous n'avez pas les permissions nécessaires pour cette action.";
    public static final String ACTION_NOT_ALLOWED = "Cette action n'est pas autorisée.";

    // Erreurs système
    public static final String INTERNAL_SERVER_ERROR = "Une erreur système est survenue. Veuillez réessayer plus tard.";
    public static final String SERVICE_UNAVAILABLE = "Le service est temporairement indisponible. Veuillez réessayer plus tard.";
}
