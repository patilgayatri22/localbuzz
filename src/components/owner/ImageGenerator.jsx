/* eslint-disable @next/next/no-img-element */
import { generateImageVariants } from "@/lib/pollinationsAPI";

export default function ImageGenerator({ prompt }) {
  const images = generateImageVariants(prompt);
  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((url) => (
        <img key={url} src={url} alt="Generated variation" className="rounded-xl object-cover" />
      ))}
    </div>
  );
}
