# ONDC Platform Understanding Document

## Introduction
The Open Network for Digital Commerce (ONDC) is an initiative by the Government of India, launched in 2021 under the DPIIT, to create an open, interoperable framework for digital commerce. Unlike traditional platform-centric e-commerce models, ONDC enables seamless transactions across different buyer and seller apps, fostering an inclusive digital marketplace.

## Purpose and Benefits
ONDC aims to democratize e-commerce by reducing dependency on large platforms, empowering MSMEs, and enhancing competition. It allows small sellers to reach a wider audience without high fees, promotes innovation through open protocols, and targets 25% of India’s digital commerce by 2025, spanning sectors like retail, food, mobility, and travel.

## Network Architecture
ONDC operates as a decentralized network of participants:  
- **Buyer Apps:** Platforms for customers to search and buy (e.g., Paytm).  
- **Seller Apps:** Platforms for listing products (e.g., the PoC app).  
- **Gateways:** Route buyer searches to sellers.  
- **Technology Service Providers (TSPs):** Support integration.  
The transaction flow—discovery, order, fulfillment, payment—is standardized using open APIs, ensuring interoperability across platforms.

## Key Features
- **Interoperability:** Sellers can connect with buyers on any ONDC app.  
- **Unbundled Logistics:** Sellers choose logistics providers independently.  
- **Standardized Cataloguing:** Products are listed using a common schema (e.g., name, price, category).  
- **Scalability:** Supports diverse sectors beyond retail.  

## Relevance to Seller App Development
For Assentcode’s seller app PoC, ONDC’s standardized cataloguing and APIs are critical. The app must publish catalogues using ONDC’s `/catalogue` endpoint, ensuring product data aligns with ONDC’s schema. This enables integration with the network, allowing our app to interact with buyer apps and gateways.

## Conclusion
ONDC’s open framework offers significant opportunities for building scalable, interoperable seller apps. The next step is to implement the PoC using React.js, Node.js, and PostgreSQL, integrating with ONDC’s APIs for catalogue publishing.

**Prepared by:** Jonathan Abraham Pulipaka  
**Date:** June 05, 2025