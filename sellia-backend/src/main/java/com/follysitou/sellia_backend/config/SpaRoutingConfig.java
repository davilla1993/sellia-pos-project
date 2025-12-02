package com.follysitou.sellia_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Configuration pour servir l'application Angular (SPA)
 * Toutes les routes non-API sont redirigées vers index.html
 * pour permettre le routing côté client Angular
 */
@Configuration
public class SpaRoutingConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(SpaRoutingConfig.class);

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir les fichiers statiques Angular et gérer le routing SPA
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        try {
                            Resource requestedResource = location.createRelative(resourcePath);

                            // Si la ressource existe (fichier JS, CSS, images, etc.), la retourner
                            if (requestedResource.exists() && requestedResource.isReadable()) {
                                if (logger.isDebugEnabled()) {
                                    logger.debug("Serving static resource: " + resourcePath);
                                }
                                return requestedResource;
                            }

                            // Pour les fichiers statiques manquants (JS, CSS, etc.), retourner null (404)
                            // Ne pas rediriger vers index.html pour éviter les erreurs
                            if (isStaticResource(resourcePath)) {
                                logger.warn("Static resource not found: " + resourcePath);
                                return null;
                            }

                            // Pour les routes Angular (non-API, non-statiques), retourner index.html
                            if (!resourcePath.startsWith("api/")) {
                                if (logger.isDebugEnabled()) {
                                    logger.debug("SPA routing - redirecting to index.html: " + resourcePath);
                                }
                                Resource indexHtml = new ClassPathResource("/static/index.html");
                                if (indexHtml.exists()) {
                                    return indexHtml;
                                } else {
                                    logger.error("index.html not found in classpath:/static/");
                                    return null;
                                }
                            }

                            return null;
                        } catch (Exception e) {
                            logger.error("Error serving resource: " + resourcePath + " - " + e.getMessage(), e);
                            // Ne pas propager l'exception, retourner null pour générer une 404
                            return null;
                        }
                    }

                    /**
                     * Détermine si un chemin correspond à une ressource statique
                     */
                    private boolean isStaticResource(String path) {
                        return path.endsWith(".js") || path.endsWith(".js.map") ||
                               path.endsWith(".css") || path.endsWith(".css.map") ||
                               path.endsWith(".woff") || path.endsWith(".woff2") ||
                               path.endsWith(".ttf") || path.endsWith(".eot") ||
                               path.endsWith(".svg") || path.endsWith(".png") ||
                               path.endsWith(".jpg") || path.endsWith(".jpeg") ||
                               path.endsWith(".gif") || path.endsWith(".ico") ||
                               path.endsWith(".webp") || path.startsWith("assets/");
                    }
                });
    }
}
