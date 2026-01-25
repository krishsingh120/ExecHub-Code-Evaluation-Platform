## Extra feature - (Todo)

1. setup bull dashboard/UI  - ✅done
2. setup logging using `winston` and store on mongoDB or cosmosDB
3. Error Handling
4. Load testing using k6 and grafana.
5. Unit testing using jest.
6. Write `README` file properly.





## BullMQ (Redis)
1. BullMQ is a high-level job queue framework that uses Redis internally, just like an ORM uses MySQL under the hood to simplify complex operations.

2. BullMQ cannot work without Redis
3. BullMQ stores jobs, states, retries, and delays inside Redis.
    - 👉 Redis is the core engine BullMQ depends on.

4. Redis can work without BullMQ
5. Redis is a general-purpose data store (cache, pub/sub, streams, locks).
    - 👉 BullMQ is just one possible use case built on top of Redis.
__________________________________________________________________________






## Integration Testing  
- Test multiple modules working together (You test how two or more parts work together.)
                          e.g., (Controller + Route + Service) (but with mock DB)


Note: You move from small → bigger tests only when the smaller parts are working correctly.

  - You should always finish Unit Testing first,
  - then move to Integration Testing,
  - and finally, if needed, End-to-End (E2E) Testing.






## Unit Testing
----------------


1. what is unit testing?
2. why do we need it?
3. Unit testing Tool --> Jest
4. Demo of jest (syntax)
5. ExecHub - Integrate Jest on (Controller layer)


  -  Unit testing => Try to test the code by going at the smallest units.
  -  Hit Api => (req) goes from routes -> controller -> service -> repository -> DB.

#### controllers
  - > ping()
  - > addProblem()
  - > getProblem()


