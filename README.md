# SmartMove - Plateforme de Mobilité Intelligente

Bienvenue dans **SmartMove**, une application microservices pour la gestion de trafic, d'incidents et de météo en temps réel.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
1.  **Java JDK 17** ou supérieur.
2.  **Node.js** (v18 ou supérieur) et **npm**.
3.  **XAMPP** (ou un serveur MySQL autonome).
4.  **Maven** (optionnel, `mvnw` est inclus).

---

## 🚀 Installation et Lancement (Pas à Pas)

### Étape 1 : Configuration de la Base de Données

1.  Lancez **XAMPP Control Panel**.
2.  Démarrez le module **Apache** et **MySQL**.
3.  Ouvrez votre navigateur sur [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
4.  Créez une nouvelle base de données nommée exactement :
    ```sql
    smartmove_db
    ```
    *(Le backend créera automatiquement les tables au lancement)*.

### Étape 2 : Lancement du Backend (Microservices)

Les services doivent être lancés dans un ordre précis. Ouvrez plusieurs terminaux (ou onglets de terminal) dans le dossier racine du projet.

**1. Discovery Service (Eureka)**
```cmd
cd discovery-service
mvn spring-boot:run
```
*Attendez que le service démarre (port 8761).*

**2. Gateway Service**
```cmd
cd gateway-service
mvn spring-boot:run
```
*(port 8888)*

**3. User Service (Authentification & DB)**
```cmd
cd user-service
mvn spring-boot:run
```
*Ce service se connectera à votre base de données MySQL et créera les tables.*

**4. Autres Services (Ordre libre)**
Lancez les autres services selon vos besoins :
```cmd
cd incident-service
mvn spring-boot:run
```
```cmd
cd traffic-service
mvn spring-boot:run
```
etc.

### Étape 3 : Lancement du Frontend (Angular)

1.  Ouvrez un nouveau terminal dans le dossier `frontend`.
2.  Installez les dépendances (première fois seulement) :
    ```cmd
    npm install
    ```
3.  Lancez l'application :
    ```cmd
    npm start
    ```
    (ou `ng serve`)
4.  L'application sera accessible sur : [http://localhost:4200](http://localhost:4200)

---

## 👤 Utilisation

1.  **Page d'Accueil** : Rendez-vous sur `http://localhost:4200`. Vous verrez la nouvelle page de garde.
2.  **Inscription** :
    *   Cliquez sur "Inscription".
    *   Créez un compte (Username, Email, Mot de passe).
    *   Si tout va bien, vous serez redirigé vers la connexion.
3.  **Connexion** :
    *   Connectez-vous avec vos identifiants.
    *   Vous accéderez au **Tableau de Bord** sécurisé.
4.  **Sécurité** :
    *   Toutes les routes (`/dashboard`, `/home`) sont protégées.
    *   Si vous essayez d'y accéder sans connexion, vous serez redirigé vers l'accueil.

---

## 🛠️ Dépannage

-   **Erreur Database** : Vérifiez que XAMPP est lancé et que la base `smartmove_db` existe.
-   **Erreur Connexion** : Vérifiez que `gateway-service` (8888) et `user-service` (8089) sont lancés.
-   **Ports occupés** : Assurez-vous que les ports 8761, 8888, 8089 ne sont pas utilisés par une autre application.

Bonne utilisation ! 🚗
