import { useState, useEffect } from 'react';

export default function StoneTopEstimator() {
  const [stoneOptions, setStoneOptions] = useState([]);
  const [file, setFile] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const correctPassword = 'stone123';

  const [products, setProducts] = useState([
    { stone: '', width: '', depth: '', quantity: 1, edgeDetail: 'Eased', result: null }
  ]);

  useEffect(() => {
    fetch("https://opensheet.elk.sh/1g8w934dZH-NEuKfK8wg_RZYiXyLSSf87H0Xwec6KAAc/Sheet1")
      .then((res) => res.json())
      .then((data) => {
        setStoneOptions(data);
        setProducts((prev) =>
          prev.map((p) => ({ ...p, stone: data[0]?.["Stone Type"] || '' }))
        );
      });
  }, []);

  const handleDrawingUpload = async (e, index) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoadingAI(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetch("https://gpt4-drawing-backend.vercel.app/api/extract-dimensions", {
        method: "POST",
        headers: {
          "x-vercel-protection-bypass": "paramusicalkariokparamusicalkari"
        },
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        const updated = [...products];
        updated[index].width = json.data.width;
        updated[index].depth = json.data.depth;
        setProducts(updated);
      } else {
        alert("AI Error: " + (json.error || "Unexpected response"));
      }
    } catch {
      alert("Failed to extract dimensions from drawing.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCalculate = (index) => {
    const product = products[index];
    const stone = stoneOptions.find(s => s["Stone Type"] === product.stone);
    if (!stone) return;

    const slabCost = parseFloat(stone["Slab Cost"]);
    const fabCost = parseFloat(stone["Fab Cost"]);
    const markup = parseFloat(stone["Mark Up"]);
    const w = parseFloat(product.width);
    const d = parseFloat(product.depth);
    const quantity = parseInt(product.quantity);

    if (!w || !d || isNaN(slabCost) || isNaN(fabCost) || isNaN(markup)) return;

    const area = w * d;
    const usableAreaSqft = (area / 144) * quantity;
    const topsPerSlab = Math.floor((63 * 126) / area);
    const materialCost = (slabCost / topsPerSlab) * quantity;
    const fabricationCost = usableAreaSqft * fabCost;
    const rawCost = materialCost + fabricationCost;
    const finalPrice = rawCost * markup;

    const updated = [...products];
    updated[index].result = {
      usableAreaSqft,
      topsPerSlab,
      materialCost,
      fabricationCost,
      rawCost,
      finalPrice
    };
    setProducts(updated);
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      { stone: stoneOptions[0]?.["Stone Type"] || '', width: '', depth: '', quantity: 1, edgeDetail: 'Eased', result: null }
    ]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl space-y-6">
        {!adminMode && (
          <div className="text-center">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="border px-4 py-2 rounded"
            />
            <button
              onClick={() => setAdminMode(adminPassword === correctPassword)}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Enter Admin Mode
            </button>
          </div>
        )}

        {products.map((product, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-md bg-gray-50 space-y-4">
            <div className="flex gap-4">
              <select
                value={product.stone}
                onChange={(e) => updateProduct(index, 'stone', e.target.value)}
                className="w-1/2 border p-2 rounded"
              >
                {stoneOptions.map((stone, i) => (
                  <option key={i} value={stone["Stone Type"]}>{stone["Stone Type"]}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Width (inches)"
                value={product.width}
                onChange={(e) => updateProduct(index, 'width', e.target.value)}
                className="w-1/2 border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Depth (inches)"
                value={product.depth}
                onChange={(e) => updateProduct(index, 'depth', e.target.value)}
                className="w-1/2 border p-2 rounded"
              />
            </div>

            <div className="flex gap-4">
              <input
                type="number"
                min="1"
                placeholder="Quantity"
                value={product.quantity}
                onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                className="w-1/2 border p-2 rounded"
              />
              <select
                value={product.edgeDetail}
                onChange={(e) => updateProduct(index, 'edgeDetail', e.target.value)}
                className="w-1/2 border p-2 rounded"
              >
                <option value="Eased">Eased</option>
                <option value="1.5” mitered">1.5” mitered</option>
              </select>
            </div>

            <input type="file" accept="image/*" onChange={(e) => handleDrawingUpload(e, index)} />
            <button
              onClick={() => handleCalculate(index)}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
            >
              Calculate
            </button>

            {product.result && (
              <div className="text-left text-sm bg-white p-4 rounded shadow">
                <p><strong>Usable Area (sqft):</strong> {product.result.usableAreaSqft.toFixed(2)}</p>
                <p><strong>Tops Per Slab:</strong> {product.result.topsPerSlab}</p>
                <p><strong>Material Cost:</strong> ${product.result.materialCost.toFixed(2)}</p>
                <p><strong>Fabrication Cost:</strong> ${product.result.fabricationCost.toFixed(2)}</p>
                <p><strong>Raw Cost:</strong> ${product.result.rawCost.toFixed(2)}</p>
                <p><strong>Final Price:</strong> ${product.result.finalPrice.toFixed(2)}</p>
              </div>
            )}

            {products.length > 1 && (
              <button
                onClick={() => removeProduct(index)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button onClick={addProduct} className="px-4 py-2 bg-blue-600 text-white rounded">
          Add Another Product
        </button>
      </div>
    </div>
  );
}