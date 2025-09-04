import PastelBackground from "@/components/background/PastelBackground";
import PastelBackground2 from "@/components/background/PastelBackground2";
import PastelBackground3 from "@/components/background/PastelBackground3";
import PastelBackground4 from "@/components/background/PastelBackground4";
import PastelBackground5 from "@/components/background/PastelBackground5";

const backgrounds = [
  PastelBackground,
  PastelBackground2,
  PastelBackground3,
  PastelBackground4,
  PastelBackground5,
];

export default function RandomPastelBackground() {
  // 0 ~ backgrounds.length - 1 중 랜덤 선택
  const RandomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  return <RandomBg />;
}
