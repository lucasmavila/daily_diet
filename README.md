# API for daily diet control, the Daily Diet API

## Functional Requirements

- [x] It must be possible to create a user
- [x] It must be possible to identify the user between requests
- [x] It must be possible to record a meal eaten, with the following information:  
  *Meals must be related to a user.*
  - [x] Name
  - [x] Description
  - [x] Date and time
  - [x] Is it on the diet or not

- [x] It must be possible to edit a meal, being able to change all the data above
- [x] It must be possible to delete a meal
- [x] It should be possible to list all of a user's meals
- [x] It must be possible to view a single meal
- [x] It must be possible to retrieve a user's metrics
     - [x] Total number of meals recorded
     - [x] Total number of meals within the diet
     - [x] Total number of meals outside the diet
     - [x] Better sequence of meals within the diet
- [x] The user can only view, edit and delete the meals he created

## Non Functional Requirements

 - Fastify framework
 - Typescript
 - SQLite Database
 - Knex - SQL query builder
 - Tests with Vitest
