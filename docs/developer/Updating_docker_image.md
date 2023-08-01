# Updating docker image

```bash
docker build -t eventuras .
docker tag eventmanagement losolio/eventuras
docker login
docker push losolio/eventuras
```
