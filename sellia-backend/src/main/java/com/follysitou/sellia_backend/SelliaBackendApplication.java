package com.follysitou.sellia_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SelliaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SelliaBackendApplication.class, args);
	}

}
