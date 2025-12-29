# 🚗 SmartMove - Plateforme de Mobilité Intelligente

Bienvenue dans **SmartMove**, une plateforme microservices avancée pour la gestion de trafic, d'incidents et la prédiction de trajets en temps réel.

---

## 🏗️ Architecture Technique

Le projet est divisé en **8 Microservices** Spring Boot et un Frontend Angular :

| Service | Port | Description |
| :--- | :--- | :--- |
| **Discovery Service** | `8761` | Serveur Eureka (Annuaire des services) |
| **Gateway Service** | `8888` | API Gateway (Point d'entrée unique) |
| **User Service** | `8080/8089` | Gestion des utilisateurs & Authentification (JWT) |
| **Traffic Service** | `8082` | Gestion du trafic routier |
| **Meteo Service** | `8083` | Données météorologiques |
| **Incident Service** | `8084` | Gestion des accidents et travaux |
| **Prediction Service** | `8085` | Algorithmes de prédiction de trajet |
| **Notification Service** | `8086` | Notifications temps réel (Kafka + WebSocket) |
| **Frontend** | `4200` | Application Angular 20 (Standalone Components) |

**Technologies Clés :**
*   **Backend :** Java 17, Spring Boot 3.3.7, OpenFeign, Resilience4j (Circuit Breaker).
*   **Data & Message :** MySQL 8, Apache Kafka, Zookeeper.
*   **Frontend :** Angular 20, Google Maps API, Bootstrap/Tailwind.

---

## 📋 Prérequis

Avant de commencer, installez :
1.  **Java JDK 17** ou supérieur.
2.  **Node.js 18+** & **NPM**.
3.  **MySQL** (via XAMPP ou Docker).
4.  **Apache Kafka & Zookeeper** (Requis pour les notifications).

---

## 🚀 Guide de Démarrage (Pas à Pas)

### 1️⃣ Base de Données & Kafka
1.  Lancez **XAMPP** (Apache + MySQL).
2.  Créez la base de données : `smartmove_db`.
3.  Démarrez **Zookeeper** puis **Kafka Server** (Port 9092).

### 2️⃣ Lancement du Backend (Ordre Strict)
Ouvrez des terminaux séparés pour chaque service :

**Groupe 1 : Infrastructure**
```bash
# 1. Discovery (Attendre qu'il soit UP)
cd discovery-service && mvn spring-boot:run

# 2. Gateway
cd gateway-service && mvn spring-boot:run
```

**Groupe 2 : Services Métier**
```bash
# 3. User Service (Crée les tables)
cd user-service && mvn spring-boot:run

# 4. Autres services (Ordre libre)
cd traffic-service && mvn spring-boot:run
cd meteo-service && mvn spring-boot:run
cd incident-service && mvn spring-boot:run
cd prediction-service && mvn spring-boot:run
cd notification-service && mvn spring-boot:run
```

### 3️⃣ Lancement du Frontend
```bash
cd frontend
npm install  # (Premier lancement uniquement)
ng serve
```
Accédez à l'application sur : **http://localhost:4200**

---

## 🛡️ Fonctionnalités Clés (Pour l'Examen)

*   **Sécurité :** Authentification JWT Stateless. Guards Angular pour protéger les routes.
*   **Résilience :** Utilisation de `@CircuitBreaker` pour gérer les pannes des services externes (Météo/TomTom).
*   **Communication :**
    *   *Synchrone :* OpenFeign (ex: Prediction appelle Traffic).
    *   *Asynchrone :* Kafka (ex: Incident détecté -> Envoi notif).
*   **DTO Pattern :** Utilisation stricte de DTOs pour ne pas exposer les Entités JPA.

---

## 🛠️ Dépannage Rapide
*   **Erreur `Connection Refused`** : Vérifiez que Discovery (8761) ou Kafka (9092) sont lancés.
*   **Port déjà utilisé** : Vérifiez qu'aucun processus fantôme java ne tourne (`jps` command).
*   **Front Page Blanche** : Vérifiez la console F12 pour les erreurs CORS ou de connexion.

Bonne chance pour le quiz ! 🎓
