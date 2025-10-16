2025-10-16T17:11:44.401Z DEBUG 9928 --- [sellia-api] [nio-8080-exec-9] o.s.security.web.FilterChainProxy        : Securing POST /api/users
2025-10-16T17:11:44.406Z DEBUG 9928 --- [sellia-api] [nio-8080-exec-9] org.hibernate.SQL                        : 
    select
        u1_0.id,
        u1_0.active,
        u1_0.created_at,
        u1_0.created_by,
        u1_0.deleted,
        u1_0.deleted_at,
        u1_0.deleted_by,
        u1_0.email,
        u1_0.first_login,
        u1_0.first_name,
        u1_0.last_login,
        u1_0.last_name,
        u1_0.password,
        u1_0.phone_number,
        u1_0.profile_image,
        u1_0.public_id,
        u1_0.role_id,
        u1_0.updated_at,
        u1_0.updated_by,
        u1_0.username 
    from
        users u1_0 
    where
        u1_0.username=?
Hibernate: 
    select
        u1_0.id,
        u1_0.active,
        u1_0.created_at,
        u1_0.created_by,
        u1_0.deleted,
        u1_0.deleted_at,
        u1_0.deleted_by,
        u1_0.email,
        u1_0.first_login,
        u1_0.first_name,
        u1_0.last_login,
        u1_0.last_name,
        u1_0.password,
        u1_0.phone_number,
        u1_0.profile_image,
        u1_0.public_id,
        u1_0.role_id,
        u1_0.updated_at,
        u1_0.updated_by,
        u1_0.username 
    from
        users u1_0 
    where
        u1_0.username=?
2025-10-16T17:11:44.410Z ERROR 9928 --- [sellia-api] [nio-8080-exec-9] c.f.s.security.JwtAuthenticationFilter   : Could not set user authentication in security context

org.hibernate.LazyInitializationException: Could not initialize proxy [com.follysitou.sellia_backend.model.Role#1] - no session
	at org.hibernate.proxy.AbstractLazyInitializer.initialize(AbstractLazyInitializer.java:174) ~[hibernate-core-6.6.29.Final.jar:6.6.29.Final]
	at org.hibernate.proxy.AbstractLazyInitializer.getImplementation(AbstractLazyInitializer.java:328) ~[hibernate-core-6.6.29.Final.jar:6.6.29.Final]
	at org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor.intercept(ByteBuddyInterceptor.java:44) ~[hibernate-core-6.6.29.Final.jar:6.6.29.Final]
	at org.hibernate.proxy.ProxyConfiguration$InterceptorDispatcher.intercept(ProxyConfiguration.java:102) ~[hibernate-core-6.6.29.Final.jar:6.6.29.Final]
	at com.follysitou.sellia_backend.model.Role$HibernateProxy.getName(Unknown Source) ~[classes/:na]
	at com.follysitou.sellia_backend.security.UserPrincipal.build(UserPrincipal.java:29) ~[classes/:na]
	at com.follysitou.sellia_backend.security.CustomUserDetailsService.loadUserByUsername(CustomUserDetailsService.java:27) ~[classes/:na]
	at com.follysitou.sellia_backend.security.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:32) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191) ~[spring-security-web-6.5.5.jar:6.5.5]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.web.filter.ServletRequestPathFilter.doFilter(ServletRequestPathFilter.java:52) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebSecurityConfiguration.java:319) ~[spring-security-config-6.5.5.jar:6.5.5]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$4(HandlerMappingIntrospector.java:267) ~[spring-webmvc-6.2.11.jar:6.2.11]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:240) ~[spring-security-config-6.5.5.jar:6.5.5]
	at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:362) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:278) ~[spring-web-6.2.11.jar:6.2.11]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.11.jar:6.2.11]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.11.jar:6.2.11]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.2.11.jar:6.2.11]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.11.jar:6.2.11]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:483) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:116) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:398) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:903) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1776) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:975) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:493) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.46.jar:10.1.46]
	at java.base/java.lang.Thread.run(Thread.java:1570) ~[na:na]

2025-10-16T17:11:44.413Z DEBUG 9928 --- [sellia-api] [nio-8080-exec-9] o.s.s.w.a.AnonymousAuthenticationFilter  : Set SecurityContextHolder to anonymous SecurityContext
2025-10-16T17:11:44.414Z DEBUG 9928 --- [sellia-api] [nio-8080-exec-9] o.s.s.w.a.Http403ForbiddenEntryPoint     : Pre-authenticated entry point called. Rejecting access
2025-10-16T17:11:44.415Z DEBUG 9928 --- [sellia-api] [nio-8080-exec-9] o.s.security.web.FilterChainProxy        : Securing POST /error
2025-10-16T17:11:44.416Z DEBUG 9928 --- [sellia-api] [nio-8080-exec-9] o.s.s.w.a.AnonymousAuthenticationFilter  : Set SecurityContextHolder to anonymous SecurityContext
2025-10-16T17:11:44.416Z DEBUG 9928 --- [sellia-api] [nio-8080-exec-9] o.s.s.w.a.Http403ForbiddenEntryPoint     : Pre-authenticated entry point called. Rejecting access

