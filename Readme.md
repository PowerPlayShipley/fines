# Fines Service

The fines service is the main service, this will handle the storage and retrieval, CRUD, of the Fines data.

### Note

On top of this, it could act as the Queue consumer to handle the updates from `RTF`

## Architecture

```shell
|     LB     | ------------
      |                   |
      v                   v
  | Fines | ---------> | conf |
      |
      v
 | MongoDB |
```

## Endpoints

### TBD
