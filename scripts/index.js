const carCanvas = document.getElementById("carCanvas");
const nnCanvas = document.getElementById("nnCanvas");
carCanvas.width = 200;
nnCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const nnCtx = nnCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const cars = generateCars(500);
const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, true),
  new Car(road.getLaneCenter(0), -300, 30, 50, true),
  new Car(road.getLaneCenter(2), -300, 30, 50, true),
  new Car(road.getLaneCenter(0), -500, 30, 50, true),
  new Car(road.getLaneCenter(1), -500, 30, 50, true),
  new Car(road.getLaneCenter(1), -700, 30, 50, true),
  new Car(road.getLaneCenter(2), -700, 30, 50, true),
];

let bestCar = cars[0];
loadModelFromLocalStorage();

animate();

function animate(time) {
  for (const t of traffic) {
    t.update(road.borders, []);
  }
  cars.forEach((c) => c.update(road.borders, traffic));

  bestCar = cars.find((c) => c.y === Math.min(...cars.map((c) => c.y)));
  carCanvas.height = window.innerHeight;
  nnCanvas.height = window.innerHeight;

  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
  road.draw(carCtx);

  for (const t of traffic) {
    t.draw(carCtx, "red");
  }

  carCtx.globalAlpha = 0.2;

  cars.forEach((c) => c.draw(carCtx));
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);

  carCtx.restore();

  nnCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(nnCtx, bestCar.brain);
  requestAnimationFrame(animate);
}

function generateCars(n) {
  const cars = [];

  for (let i = 0; i < n; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50));
  }

  return cars;
}

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function loadModelFromLocalStorage() {
  if (localStorage.getItem("bestBrain")) {
    const stored = JSON.parse(localStorage.getItem("bestBrain"));

    for (let i = 0; i < cars.length; ++i) {
      cars[i].brain = structuredClone(stored);

      if (i !== 0) {
        Network.mutate(cars[i].brain, 0.1);
      }
    }
  }
}

function discard() {
  localStorage.removeItem("bestBrain");
}
