# Dockerfile for Grafana
FROM grafana/grafana:latest

# Copy Grafana configuration and provisioning files
COPY ./gatewayservice/monitoring/grafana/provisioning /etc/grafana/provisioning
COPY ./gatewayservice/monitoring/grafana/dashboards /etc/grafana/dashboards
COPY ./gatewayservice/monitoring/grafana/grafana.ini /etc/grafana/grafana.ini

# Expose Grafana port
EXPOSE 9091

# Set environment variables
ENV GF_SERVER_HTTP_PORT=9091 \
    GF_AUTH_DISABLE_LOGIN_FORM=true \
    GF_AUTH_ANONYMOUS_ENABLED=true \
    GF_AUTH_ANONYMOUS_ORG_ROLE=Admin \
    GF_SECURITY_ADMIN_USER=admin \
    GF_SECURITY_ADMIN_PASSWORD=admin \
    GF_PATHS_PROVISIONING=/etc/grafana/provisioning \
    GF_PATHS_DASHBOARDS=/etc/grafana/dashboards

# Start Grafana
CMD ["/run.sh"]