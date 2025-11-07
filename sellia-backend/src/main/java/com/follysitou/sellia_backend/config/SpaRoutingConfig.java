package com.follysitou.sellia_backend.config;

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

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir les fichiers statiques Angular et gérer le routing SPA
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // Si la ressource existe (fichier JS, CSS, images, etc.), la retourner
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // Sinon, retourner index.html pour le routing Angular
                        // Sauf pour les routes API (qui commencent par /api)
                        if (!resourcePath.startsWith("api/")) {
                            return new ClassPathResource("/static/index.html");
                        }

                        return null;
                    }
                });
    }
}
