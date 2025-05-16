
import { useState, useEffect } from 'react';
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import Tesseract from 'tesseract.js';

export default function StoneTopEstimator() {
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [drawingPreview, setDrawingPreview] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDrawingPreview(url);

    const { data: { text } } = await Tesseract.recognize(file, 'eng');
    setOcrText(text);

    const matches = text.match(/\d+\s?["”]/g);
    if (matches && matches.length >= 2) {
      const nums = matches.map(m => parseInt(m));
      setWidth(nums[0]);
      setDepth(nums[1]);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <h2 className="text-xl font-bold">Stone Top Estimator (w/ Drawing Upload)</h2>
          <Input type="number" placeholder="Width (inches)" value={width} onChange={e => setWidth(e.target.value)} />
          <Input type="number" placeholder="Depth (inches)" value={depth} onChange={e => setDepth(e.target.value)} />
          <div className="pt-2">
            <label className="font-semibold">Upload Drawing:</label>
            <Input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} />
          </div>
          {drawingPreview && (
            <div>
              <img src={drawingPreview} alt="Preview" className="max-w-full mt-2 border" />
              <p className="text-xs text-gray-500 mt-2">Auto-extracted text: <br />{ocrText}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
