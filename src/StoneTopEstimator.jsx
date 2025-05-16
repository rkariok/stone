
import { useState, useEffect, useRef } from 'react';
import html2pdf from "html2pdf.js";

export default function StoneTopEstimator() {
  const [stoneOptions, setStoneOptions] = useState([]);
  const [selectedStone, setSelectedStone] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [file, setFile] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    fetch("https://opensheet.elk.sh/1g8w934dZH-NEuKfK8wg_RZYiXyLSSf87H0Xwec6KAAc/Sheet1")
      .then((res) => res.json())
      .then((data) => {
        setStoneOptions(data);
        setSelectedStone(data[0]?.["Stone Type"]);
      });
  }, []);

  const handleDrawingUpload = async (e) => {
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
        setWidth(json.data.width);
        setDepth(json.data.depth);
      } else {
        alert("AI Error: " + (json.error || "Unexpected response"));
      }
    } catch {
      alert("Failed to extract dimensions from drawing.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCalculate = () => {
    const stone = stoneOptions.find(s => s["Stone Type"] === selectedStone);
    if (!stone) return;

    const slabCost = parseFloat(stone["Slab Cost"]);
    const fabCost = parseFloat(stone["Fab Cost"]);
    const markup = parseFloat(stone["Mark Up"]);
    const w = parseFloat(width);
    const d = parseFloat(depth);

    if (!w || !d || isNaN(slabCost) || isNaN(fabCost) || isNaN(markup)) return;

    const area = w * d;
    const usableAreaSqft = area / 144;
    const topsPerSlab = Math.floor((63 * 126) / area);
    const materialCost = slabCost / topsPerSlab;
    const fabricationCost = usableAreaSqft * fabCost;
    const rawCost = materialCost + fabricationCost;
    const finalPrice = rawCost * markup;

    alert("Final Price: $" + finalPrice.toFixed(2));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl space-y-4 text-center">
        <img src="/AIC.jpg" alt="Logo" className="mx-auto mb-2" style={{ maxWidth: '140px' }} />
        <h1 className="text-base font-medium text-gray-700">Developed by Roy Kariok</h1>

        <div className="text-left space-y-2">
          <label className="block text-sm font-medium text-gray-700">Stone Type</label>
          <select
            value={selectedStone}
            onChange={(e) => setSelectedStone(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {stoneOptions.map((stone, idx) => (
              <option key={idx} value={stone["Stone Type"]}>{stone["Stone Type"]}</option>
            ))}
          </select>

          <div className="flex gap-4">
            <input type="number" placeholder="Width (in)" value={width} onChange={e => setWidth(e.target.value)} className="flex-1 p-2 border rounded" />
            <input type="number" placeholder="Depth (in)" value={depth} onChange={e => setDepth(e.target.value)} className="flex-1 p-2 border rounded" />
          </div>

          <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-dashed rounded-md cursor-pointer hover:border-blue-400">
            <input type="file" className="hidden" onChange={handleDrawingUpload} />
            {
              loadingAI ? (
                <span className="text-sm text-blue-600">Extracting dimensions...</span>
              ) : file ? (
                <span className="text-gray-600 text-center text-sm">
                  <strong>{file.name}</strong><br />
                  Uploaded. You can replace it by clicking here again.
                </span>
              ) : (
                <span className="text-gray-400 text-center text-sm">
                  Click to upload drawing<br />AI will extract dimensions
                </span>
              )
            }
          </label>

          {file && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img src={URL.createObjectURL(file)} alt="Uploaded preview" className="mx-auto rounded border max-h-60" />
            </div>
          )}
        </div>

        <button onClick={handleCalculate} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition">Calculate</button>
      </div>
    </div>
  );
}
