# 🚗 SmartMove - Plateforme de Mobilité Intelligente (100% Free & Open-Source)

Bienvenue dans **SmartMove**, une plateforme microservices avancée pour la gestion de trafic, d'incidents et la prédiction de trajets en temps réel, optimisée pour le Maroc (Casablanca et inter-villes) et fonctionnant **exclusivement avec des APIs 100% gratuites et sans quotas** (OpenStreetMap, OSRM, Leaflet, Open-Meteo).

---

## 🏗️ Architecture Technique

Le projet est composé de **8 Microservices** Spring Boot (Java 17) et d'un **Frontend Angular 20 Standalone** :

| Service | Port | Description | Découverte Eureka |
| :--- | :--- | :--- | :--- |
| **Discovery Service** | `8761` | Annuaire Eureka Server | - |
| **Gateway Service** | `8888` | API Gateway Reactive & Sécurisée + CORS | `lb://gateway-service` |
| **User Service** | `8089` | Authentification JWT & Profils Utilisateurs | `lb://user-service` |
| **Traffic Service** | `8083` | Calcul d'itinéraires & Géocodage (OSRM & Nominatim) | `lb://traffic-service` |
| **Incident Service** | `8084` | Gestion & Seeding des incidents routiers (Kafka Producer) | `lb://incident-service` |
| **Meteo Service** | `8087` | Météo temps réel Open-Meteo & alertes climatiques | `lb://meteo-service` |
| **Prediction Service** | `8086` | Prédiction intelligente de durée & Historique de trajets | `lb://prediction-service` |
| **Notification Service**| `8085` | Diffusion temps réel SSE / Kafka Consumer | `lb://notification-service` |
| **Frontend** | `4200` | Application Angular 20 Standalone & Cartographie Leaflet | - |

---

## 🗺️ Migration APIs Gratuites & Open Source

Les APIs payantes ou à quotas consommables (Google Maps, TomTom) ont été **entièrement remplacées** :
* **Cartographie Frontend :** **Leaflet** + Tuiles **OpenStreetMap** (100% gratuit, aucun token ni carte bancaire requis).
* **Calcul d'Itinéraires (Routing) :** **OSRM** (*Open Source Routing Machine*) avec géométrie GeoJSON précise.
* **Géocodage & Recherche d'adresses :** **Nominatim OpenStreetMap**.
* **Données Météo :** **Open-Meteo** (API ouverte sans clé).
* **Système d'Incidents :** Moteur autonome marocain (Casablanca : Maarif, Zerktouni, Corniche, Autoroute A3...) dispatchant des alertes automatiques via **Apache Kafka**.

---

## 📋 Prérequis

1. **Java JDK 17** (ex: Eclipse Temurin ou Microsoft OpenJDK 17).
2. **Node.js 18+** & **NPM**.
3. **Docker Desktop** (recommandé pour MySQL & Kafka) OU **XAMPP / MySQL Local** + **Kafka**.

---

## 🐳 Démarrage Rapide de l'Infrastructure (MySQL & Kafka)

Un fichier `docker-compose.yml` est fourni à la racine du projet :
```bash
docker compose up -d
```
Cela démarre instantanément :
- **MySQL 8** sur le port `3306` (avec la base `smartmove_db` auto-créée, user `root`, sans mot de passe).
- **Zookeeper** sur le port `2181`.
- **Kafka Broker** sur le port `9092` (création automatique des topics comme `incident-updates`).

*(Alternative sans Docker : Lancer MySQL via XAMPP et créer la base `smartmove_db`, puis lancer un serveur Kafka local sur le port 9092).*

---

## 🚀 Lancement des Microservices & du Frontend

### Option A : Lancement Automatique en 1 Clic (Script PowerShell)

Depuis la racine du projet, exécutez le script prêt à l'emploi :
```powershell
.\run-microservices.ps1
```
> Le script configure automatiquement `JAVA_HOME`, démarre Eureka, attend son enregistrement, démarre le Gateway, puis tous les microservices et enfin le Frontend Angular dans des fenêtres dédiées.

---

### Option B : Lancement Manuel (Ordre Suggéré)

Utilisez le wrapper Maven inclus `.\mvnw.cmd` :

```powershell
# 1. Annuaire Eureka
.\mvnw.cmd spring-boot:run -pl discovery-service

# 2. Gateway API
.\mvnw.cmd spring-boot:run -pl gateway-service

# 3. Microservices Métier
.\mvnw.cmd spring-boot:run -pl user-service
.\mvnw.cmd spring-boot:run -pl traffic-service
.\mvnw.cmd spring-boot:run -pl incident-service
.\mvnw.cmd spring-boot:run -pl meteo-service
.\mvnw.cmd spring-boot:run -pl prediction-service
.\mvnw.cmd spring-boot:run -pl notification-service

# 4. Frontend Angular
cd frontend
npm install
npm start
```

---

## 🌐 Liens Utiles

- **Application Web (Frontend) :** [http://localhost:4200](http://localhost:4200)
- **Tableau de Bord Eureka :** [http://localhost:8761](http://localhost:8761)
- **API Gateway :** [http://localhost:8888](http://localhost:8888)
- **Endpoints Clés via Gateway :**
  - Authentification : `POST http://localhost:8888/auth/register` & `POST http://localhost:8888/auth/login`
  - Prédiction de trajet : `POST http://localhost:8888/api/predictions`
  - Historique : `GET http://localhost:8888/api/history/user/{userId}`
  - Incidents : `GET http://localhost:8888/api/incidents`
  - Trafic & OSRM : `GET http://localhost:8888/api/traffic/route?origin=Maarif&destination=Casa+Port`
  - Météo en direct : `GET http://localhost:8888/api/meteo/live?latitude=33.5731&longitude=-7.5898`
  - Flux SSE Notifications : `GET http://localhost:8888/api/notifications/stream?userId=all`
