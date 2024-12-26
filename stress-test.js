const http = require("http");
const fs = require("fs");

const [,, ip, port] = process.argv;

if (!ip || !port) {
  console.log("Uso: node stress-test.js <IP> <PORT>");
  process.exit(1);
}


const path = "/";
const requestCounts = [100, 200, 500];
const outputFile = `stress_test_results_${ip}_${port}.csv`;


const measureResponseTime = async (count) => {
  let totalResponseTime = 0;

  for (let i = 0; i < count; i++) {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const req = http.request(
          { hostname: ip, port, path, method: "GET" },
          (res) => {
            res.on("data", () => {}); 
            res.on("end", resolve);
          }
        );
        req.on("error", reject);
        req.end();
      });
    } catch (err) {
      console.error(`Error en solicitud ${i + 1}:`, err.message);
      return -1;
    }

    const endTime = Date.now();
    totalResponseTime += (endTime - startTime);
  }

  return totalResponseTime / count;
};


fs.writeFileSync(outputFile, "Cantidad de Solicitudes,Tiempo Promedio (ms)\n");

const runTests = async () => {
  console.log(`Realizando pruebas de estrés a ${ip}:${port}...`);

  for (const count of requestCounts) {
    console.log(`Probando con ${count} solicitudes...`);
    const avgTime = await measureResponseTime(count);

    if (avgTime === -1) {
      console.log(`Error al realizar ${count} solicitudes.`);
      continue;
    }

    console.log(`Tiempo promedio: ${avgTime.toFixed(2)} ms`);
    fs.appendFileSync(outputFile, `${count},${avgTime.toFixed(2)}\n`);
  }

  console.log(`Pruebas completadas. Resultados guardados en ${outputFile}`);
};

runTests().catch((err) => {
  console.error("Error durante las pruebas:", err.message);
});
