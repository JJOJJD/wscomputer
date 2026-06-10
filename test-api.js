const baseUrl = "http://localhost:3014/computerstore/components";

async function runTests() {
  try {
    console.log("Starting API integration tests...");

    const listRes = await fetch(baseUrl);
    const listData = await listRes.json();
    console.log("Initial fetch count:", listData.length);
    if (listData.length !== 10) {
      throw new Error(`Expected 10 initial components, got ${listData.length}`);
    }

    const rankingRes = await fetch(`${baseUrl}/ranking`);
    const rankingData = await rankingRes.json();
    console.log("Ranking fetch count:", rankingData.length);
    let lastValueScore = Infinity;
    for (let i = 0; i < rankingData.length; i++) {
      const item = rankingData[i];
      if (item.rank !== i + 1) {
        throw new Error(`Expected rank ${i + 1}, got ${item.rank}`);
      }
      if (item.valueScore > lastValueScore) {
        throw new Error(`Ranking order is incorrect at index ${i}`);
      }
      lastValueScore = item.valueScore;
    }
    console.log("Ranking order and ranks verified successfully");

    const newComponent = {
      name: "Test GPU",
      description: "A component for integration testing",
      manufacturer: "TestMaker",
      category: "GPU",
      model: "T-100",
      price: 500,
      performanceScore: 50
    };
    const createRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComponent)
    });
    const createdData = await createRes.json();
    console.log("Created component ID:", createdData.id);
    if (createdData.id !== 11) {
      throw new Error(`Expected custom ID 11, got ${createdData.id}`);
    }
    if (createdData.valueScore !== 0.1) {
      throw new Error(`Expected valueScore 0.1, got ${createdData.valueScore}`);
    }
    if (createdData.recommended !== true) {
      throw new Error(`Expected recommended to be true for valueScore 0.1`);
    }

    const invalidComponent = {
      name: "Invalid Component",
      price: -10,
      performanceScore: 120
    };
    const invalidRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidComponent)
    });
    if (invalidRes.status !== 400) {
      throw new Error(`Expected bad request status 400, got ${invalidRes.status}`);
    }
    console.log("Validation for price and score verified successfully");

    const getRes = await fetch(`${baseUrl}/${createdData._id}`);
    const getData = await getRes.json();
    if (getData.name !== "Test GPU") {
      throw new Error(`Expected name 'Test GPU', got ${getData.name}`);
    }
    console.log("Fetch by Mongo ID verified successfully");

    const getCustomRes = await fetch(`${baseUrl}/11`);
    const getCustomData = await getCustomRes.json();
    if (getCustomData.name !== "Test GPU") {
      throw new Error(`Expected name 'Test GPU', got ${getCustomData.name}`);
    }
    console.log("Fetch by custom sequential ID verified successfully");

    const updateData = {
      price: 250,
      performanceScore: 75
    };
    const updateRes = await fetch(`${baseUrl}/11`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData)
    });
    const updatedData = await updateRes.json();
    console.log("Updated valueScore:", updatedData.valueScore);
    if (updatedData.valueScore !== 0.3) {
      throw new Error(`Expected updated valueScore 0.3, got ${updatedData.valueScore}`);
    }
    if (updatedData.recommended !== true) {
      throw new Error("Expected updated component to be recommended");
    }

    const deleteRes = await fetch(`${baseUrl}/11`, { method: "DELETE" });
    const deleteData = await deleteRes.json();
    console.log("Delete status message:", deleteData.message);
    if (deleteData.message !== "Component deleted successfully") {
      throw new Error(`Unexpected delete message: ${deleteData.message}`);
    }

    const finalRes = await fetch(`${baseUrl}/11`);
    if (finalRes.status !== 404) {
      throw new Error(`Expected 404 on deleted item, got ${finalRes.status}`);
    }
    console.log("Delete verification verified successfully");

    console.log("All API integration tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error.message);
    process.exit(1);
  }
}

runTests();
