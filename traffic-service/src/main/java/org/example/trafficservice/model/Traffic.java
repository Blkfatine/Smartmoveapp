package org.example.trafficservice.model;
import jakarta.persistence.*;


    @Entity
    public class Traffic {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private double latitude;
        private double longitude;

        private int congestionLevel;
        // ➕ Champs ajoutés
        private String source;

        @Column(columnDefinition = "TEXT")  // le JSON peut être long
        private String rawResponse;

        public Traffic() {}

        public Traffic(Long id, double latitude, double longitude, int congestionLevel, String source, String rawResponse) {
            this.id = id;
            this.latitude = latitude;
            this.longitude = longitude;
            this.congestionLevel = congestionLevel;
            this.source = source;
            this.rawResponse = rawResponse;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public double getLatitude() {
            return latitude;
        }

        public void setLatitude(double latitude) {
            this.latitude = latitude;
        }

        public double getLongitude() {
            return longitude;
        }

        public void setLongitude(double longitude) {
            this.longitude = longitude;
        }

        public int getCongestionLevel() {
            return congestionLevel;
        }

        public void setCongestionLevel(int congestionLevel) {
            this.congestionLevel = congestionLevel;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public String getRawResponse() {
            return rawResponse;
        }

        public void setRawResponse(String rawResponse) {
            this.rawResponse = rawResponse;
        }
    }
