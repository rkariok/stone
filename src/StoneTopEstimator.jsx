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
  const [allResults, setAllResults] = useState([]);

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

  const calculateAll = () => {
    const results = products.map((product) => {
      const stone = stoneOptions.find(s => s["Stone Type"] === product.stone);
      if (!stone) return { ...product, result: null };

      const slabCost = parseFloat(stone["Slab Cost"]);
      const fabCost = parseFloat(stone["Fab Cost"]);
      const markup = parseFloat(stone["Mark Up"]);
      const w = parseFloat(product.width);
      const d = parseFloat(product.depth);
      const quantity = parseInt(product.quantity);

      if (!w || !d || isNaN(slabCost) || isNaN(fabCost) || isNaN(markup)) return { ...product, result: null };

      const area = w * d;
      const usableAreaSqft = (area / 144) * quantity;
      const topsPerSlab = Math.floor((63 * 126) / area);
      const materialCost = (slabCost / topsPerSlab) * quantity;
      const fabricationCost = usableAreaSqft * fabCost;
      const rawCost = materialCost + fabricationCost;
      const finalPrice = rawCost * markup;

      return {
        ...product,
        result: {
          usableAreaSqft,
          topsPerSlab,
          materialCost,
          fabricationCost,
          rawCost,
          finalPrice
        }
      };
    });

    setAllResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl space-y-6 text-center">
        <img src="/AIC.jpg" alt="Logo" className="mx-auto mb-2" style={{ maxWidth: '140px' }} />

        {!adminMode && (
          <div className="mb-4">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Admin Password"
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
          <div key={index} className="bg-gray-50 p-4 rounded shadow space-y-4 text-left">
            <div className="grid grid-cols-3 gap-4">
              <select
                value={product.stone}
                onChange={(e) => updateProduct(index, 'stone', e.target.value)}
                className="border px-4 py-2 rounded"
              >
                {stoneOptions.map((stone, i) => (
                  <option key={i} value={stone["Stone Type"]}>{stone["Stone Type"]}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Width (in)"
                value={product.width}
                onChange={(e) => updateProduct(index, 'width', e.target.value)}
                className="border px-4 py-2 rounded"
              />
              <input
                type="number"
                placeholder="Depth (in)"
                value={product.depth}
                onChange={(e) => updateProduct(index, 'depth', e.target.value)}
                className="border px-4 py-2 rounded"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Quantity"
                value={product.quantity}
                onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                className="border px-4 py-2 rounded"
              />
              <select
                value={product.edgeDetail}
                onChange={(e) => updateProduct(index, 'edgeDetail', e.target.value)}
                className="border px-4 py-2 rounded"
              >
                <option value="Eased">Eased</option>
                <option value="1.5” mitered">1.5” mitered</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleDrawingUpload(e, index)}
                className="border px-4 py-2 rounded"
              />
            </div>

            {products.length > 1 && (
              <button type="button" onClick={() => removeProduct(index)} className="text-red-600 font-bold text-xl absolute top-2 right-2">&times;</button>
            ) && (
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="text-red-600 text-sm"
              >
                Remove Product
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addProduct}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Another Product
        </button>

        <button
          onClick={calculateAll}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Calculate All
        </button>

        {allResults.length > 0 && (
          <div className="overflow-x-auto mt-6">
            <table className="table-auto border-collapse border w-full text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">Stone</th>
                  <th className="border px-4 py-2">Size</th>
                  <th className="border px-4 py-2">Qty</th>
                  <th className="border px-4 py-2">Edge</th>
                  <th className="border px-4 py-2">Area (sqft)</th>
                  <th className="border px-4 py-2">Tops/Slab</th>
                  <th className="border px-4 py-2">Material $</th>
                  <th className="border px-4 py-2">Fab $</th>
                  <th className="border px-4 py-2">Raw $</th>
                  <th className="border px-4 py-2">Final $</th>
                </tr>
              </thead>
              <tbody>
                {allResults.map((p, i) => (
                  <tr key={i} className="text-center">
                    <td className="border px-4 py-2">{p.stone}</td>
                    <td className="border px-4 py-2">{p.width}x{p.depth}</td>
                    <td className="border px-4 py-2">{p.quantity}</td>
                    <td className="border px-4 py-2">{p.edgeDetail}</td>
                    <td className="border px-4 py-2">{p.result?.usableAreaSqft.toFixed(2)}</td>
                    <td className="border px-4 py-2">{p.result?.topsPerSlab}</td>
                    <td className="border px-4 py-2">${p.result?.materialCost.toFixed(2)}</td>
                    <td className="border px-4 py-2">${p.result?.fabricationCost.toFixed(2)}</td>
                    <td className="border px-4 py-2">${p.result?.rawCost.toFixed(2)}</td>
                    <td className="border px-4 py-2 font-semibold">${p.result?.finalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
            <h1 className="text-base font-medium text-gray-700 text-center mt-6">Developed by Roy Kariok</h1>
      </div>
  );
}