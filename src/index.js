import { Router } from "@fastly/expressly";

const PRODUCTS_BACKEND = "origin_0";
const router = new Router();
let backendResponse;

// Configure middleware that automatically proxies request
// asynchronously to your backend and sets the global variable
// for use in all your base request handlers.
router.use(async (req, res) => {
  backendResponse = await fetch(req, {
    backend: PRODUCTS_BACKEND
  });
});

// If the URL begins with /json
router.get("/json", async (req, res) => {
  // Parse the JSON response from the backend.
  const data = await backendResponse.json();

  // Add a new field to the parsed data.
  data["new_field"] = "data injected at the edge";

  // Construct a new response using the new data but original status.
  res.withStatus(backendResponse.status).json(data);
});

router.all("(.*)", async (req, res) => {
  res.send(backendResponse);
});

router.listen();
