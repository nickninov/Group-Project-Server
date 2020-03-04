FROM mongo
COPY users.json products.json orders.json counters.json categories.json ./
ADD start.sh /
RUN chmod +x /start.sh
CMD ["/start.sh"]