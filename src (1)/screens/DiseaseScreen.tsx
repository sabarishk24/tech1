import { useState } from "react"
import { useApp } from "../context"
import { Card, Badge } from "../components/ui"
import { ScreenHeader } from "../components/Layout"

const DISEASES = [
  {
    id: "d1",
    name: "Rice Blast",
    crop: "Paddy",
    risk: "high",
    symptoms:
      "Diamond-shaped lesions on leaves, gray centers with brown borders.",
    treatment:
      "Spray Tricyclazole (0.6g/L) or Isoprothiolane (1.5ml/L). Reduce nitrogen. Improve drainage.",
    prevention:
      "Use resistant varieties. Avoid excess nitrogen. Maintain proper spacing.",
  },
  {
    id: "d2",
    name: "Brown Plant Hopper",
    crop: "Paddy",
    risk: "high",
    symptoms: "Yellowing and wilting of plants, hopping insects at base.",
    treatment:
      "Apply Imidacloprid or Thiamethoxam. Drain field for 3-4 days. Avoid excessive use of insecticides.",
    prevention:
      "Use BPH-resistant varieties. Avoid excess nitrogen fertilizer. Maintain field hygiene.",
  },
  {
    id: "d3",
    name: "Tikka Disease",
    crop: "Groundnut",
    risk: "medium",
    symptoms: "Small circular spots with yellow halo on leaves, defoliation.",
    treatment:
      "Spray Mancozeb (0.25%) or Carbendazim (0.1%). Apply at 10-day intervals.",
    prevention:
      "Crop rotation. Seed treatment with Thiram. Use certified disease-free seeds.",
  },
  {
    id: "d4",
    name: "Stem Borer",
    crop: "Paddy",
    risk: "medium",
    symptoms:
      "Dead heart in vegetative stage, white ears at reproductive stage.",
    treatment:
      "Apply Chlorantraniliprole or Cartap hydrochloride. Remove and destroy egg masses.",
    prevention:
      "Synchronize planting. Use light traps. Maintain proper plant spacing.",
  },
]

export default function DiseaseScreen() {
  const { t, back } = useApp()
  const [selectedDisease, setSelectedDisease] =
    useState<typeof DISEASES[0] | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [scanDone, setScanDone] = useState(false)

  const handleScan = async () => {
    setShowCamera(true)
    await new Promise((r) => setTimeout(r, 2000))
    setShowCamera(false)
    setScanDone(true)
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title={t("nav.disease")} back={back} />

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
        {/* AI Scan CTA */}
        <div className="bg-gradient-to-br from-teal to-primary rounded-[20px] p-5 text-white text-center">
          <div className="text-4xl mb-2">🔬</div>
          <h2 className="font-bold text-lg mb-1">AI Disease Detection</h2>
          <p className="text-sm text-white/75 mb-4">
            Take a photo of your crop for instant disease diagnosis
          </p>
          {showCamera ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Analyzing image...</span>
            </div>
          ) : scanDone ? (
            <div className="bg-white/20 rounded-[12px] p-3 text-sm">
              ✓ Analysis complete. Detected:{" "}
              <strong>Early signs of Leaf Blast</strong>. Confidence: 87%
            </div>
          ) : (
            <button
              onClick={handleScan}
              className="bg-white text-primary font-bold px-6 py-2.5 rounded-[12px] hover:bg-white/90 transition-colors"
            >
              📷 Scan Now
            </button>
          )}
        </div>

        {/* Alerts in region */}
        <Card className="bg-amber-50 border-amber-200" padding="sm">
          <p className="text-xs font-bold text-amber-700 mb-1">
            ⚠️ Active Alerts in Chengalpattu
          </p>
          <p className="text-xs text-amber-600">
            Paddy Blast reported in 3 farms within 10km. High humidity (80%+)
            increases risk.
          </p>
        </Card>

        {/* Known diseases */}
        <div>
          <h3 className="font-bold text-text mb-3">
            Common Diseases This Season
          </h3>
          <div className="flex flex-col gap-3">
            {DISEASES.map((d) => (
              <Card
                key={d.id}
                onClick={() =>
                  setSelectedDisease(selectedDisease?.id === d.id ? null : d)
                }
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🦠</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text">{d.name}</span>
                      <Badge variant={d.risk === "high" ? "red" : "amber"}>
                        {d.risk} risk
                      </Badge>
                    </div>
                    <p className="text-xs text-muted">Affects: {d.crop}</p>
                  </div>
                  <span className="text-muted text-sm">
                    {selectedDisease?.id === d.id ? "▲" : "▼"}
                  </span>
                </div>
                {selectedDisease?.id === d.id && (
                  <div className="mt-3 border-t border-border/50 pt-3 flex flex-col gap-2">
                    <div>
                      <p className="text-xs font-bold text-text mb-1">
                        Symptoms:
                      </p>
                      <p className="text-xs text-muted">{d.symptoms}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text mb-1">
                        Treatment:
                      </p>
                      <p className="text-xs text-muted">{d.treatment}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text mb-1">
                        Prevention:
                      </p>
                      <p className="text-xs text-muted">{d.prevention}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
