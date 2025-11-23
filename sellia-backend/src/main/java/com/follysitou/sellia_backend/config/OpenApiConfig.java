package com.follysitou.sellia_backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${app.server-url:http://localhost:8080}")
    private String serverUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Sellia POS API")
                        .version("1.0.0")
                        .description("""
                                API REST pour Sellia POS - Système de point de vente pour restaurants.

                                ## Authentification

                                La plupart des endpoints nécessitent une authentification JWT.
                                1. Utilisez `/api/auth/login` pour obtenir un token
                                2. Cliquez sur "Authorize" et entrez: `Bearer <votre-token>`

                                ## Rôles

                                - **ADMIN** : Accès complet
                                - **CAISSE** : Gestion des commandes et paiements
                                - **CUISINE** : Vue des tickets cuisine
                                - **BAR** : Vue des tickets bar
                                - **AUDITOR** : Logs d'audit et monitoring
                                """)
                        .contact(new Contact()
                                .name("Support Sellia")
                                .email("support@sellia.com"))
                        .license(new License()
                                .name("Propriétaire")
                                .url("https://sellia.com")))
                .servers(List.of(
                        new Server()
                                .url(serverUrl)
                                .description("Serveur principal")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Entrez le JWT token obtenu via /api/auth/login")));
    }
}
