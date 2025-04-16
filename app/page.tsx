import Lightning from "@/components/lightning";
import TheHordeForm from "@/components/the-horde-form";

export default function Home() {
  return (
    <div className="absolute w-full h-full">
      <Lightning hue={220} xOffset={0} speed={1} intensity={1} size={1} />
      <div className="absolute flex flex-col gap-5 justify-center items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="md:text-5xl text-3xl font-bold text-white text-nowrap">
          IT IS COMING
        </h1>
        <TheHordeForm />
      </div>
    </div>
  );
}
