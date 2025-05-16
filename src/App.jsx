import React, { useState } from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
        <div className="text-center mb-6">
          <img src="/AIC.jpg" alt="AIC Logo" className="h-16 mx-auto mb-2" />
          <h1 className="text-xl font-semibold">Stone Top Estimator</h1>
          <p className="text-sm text-gray-500">Developed by Roy Kariok</p>
        </div>
        <div className="space-y-4">
          <label className="block">
            Stone Type
            <select className="mt-1 w-full border rounded px-2 py-1">
              <option>Calacatta Gold Marble</option>
              <option>Calacatta Ola</option>
              <option>Calacatta Sertum</option>
              <option>Calacatta Bid</option>
            </select>
          </label>
          <div className="flex gap-4">
            <label className="block flex-1">
              Width (inches)
              <input type="number" className="mt-1 w-full border rounded px-2 py-1" />
            </label>
            <label className="block flex-1">
              Depth (inches)
              <input type="number" className="mt-1 w-full border rounded px-2 py-1" />
            </label>
          </div>
          <label className="block border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500">
            Click to upload drawing<br />AI will extract dimensions
            <input type="file" className="hidden" />
          </label>
          <button className="w-full bg-blue-600 text-white py-2 rounded mt-2">Calculate Estimate</button>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Estimate Results</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Stone Type: <strong>Calacatta Gold Marble</strong></div>
            <div>Dimensions: <strong>36” × 22”</strong></div>
            <div>Usable Area: <strong>5.50 sq ft</strong></div>
            <div>Tops Per Slab: <strong>8</strong></div>
            <div>Material Cost: <strong>$312.50</strong></div>
            <div>Fabrication Cost: <strong>$440.00</strong></div>
            <div>Raw Cost: <strong>$752.50</strong></div>
            <div className="text-blue-600 font-bold">Final Price: $1505.00</div>
          </div>
        </div>
        <button className="mt-6 w-full bg-gray-800 text-white py-2 rounded">Download Quote</button>
      </div>
    </div>
  );
}
