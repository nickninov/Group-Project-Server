FROM mongo
COPY products.json users.json counters.json categories.json ./
ADD start.sh /
RUN chmod +x /start.sh
CMD ["/start.sh"]