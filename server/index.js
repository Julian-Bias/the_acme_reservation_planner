const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation,
} = require("./db");

const express = require("express");
const app = express();

app.use(require("morgan")("dev"));
app.use(express.json());

//get customers
app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (ex) {
    next(ex);
  }
});

//get restaurants
app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

//get reservations
app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (ex) {
    next(ex);
  }
});

//delete reservation
app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyVacation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

const init = async () => {
  await client.connect();
  await createTables();

  const [julian, mark, woody, ruffinos, chimes, outback] = await Promise.all([
    createCustomer({ name: "julian" }),
    createCustomer({ name: "mark" }),
    createCustomer({ name: "woody" }),
    createRestaurant({ name: "ruffinos" }),
    createRestaurant({ name: "chimes" }),
    createRestaurant({ name: "outback" }),
  ]);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation] = await Promise.all([
    createReservation({
      customer_id: julian.id,
      restaurant_id: ruffinos.id,
      reservation_date: "12/25/2025",
      party_count: "3",
    }),
  ]);
  console.log(await fetchReservations());

  await destroyReservation({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });
  console.log(await fetchReservations());

  //post reservation
  app.post(
    "/api/customers/:id/reservations",
    async (req, res, next) => {
      try {
        res.status(201).send(
          await createReservation({
            customer_id: req.params.id,
            restaurant_id: req.body.restaurant_id,
            reservation_date: req.body.reservation_date,
            party_count: req.body.party_count,
          })
        );
      } catch (ex) {
        next(ex);
      }
    }
  );

  //error handling
  app.use((err, req, res, next) => {
    res.status(err.status || 500).send({ error: err.message || err });
  });

  //port
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on post ${port}`);
  });
};

init();
