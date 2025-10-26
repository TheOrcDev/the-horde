import Lightning from "@/components/lightning";
import TheHordeForm from "@/components/the-horde-form";

export default function Home() {
  return (
    <div className="absolute h-full w-full">
      <Lightning hue={220} intensity={1} size={1} speed={1} xOffset={0} />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex flex-col items-center justify-center gap-5">
        <h1 className="text-nowrap font-bold text-3xl text-white md:text-5xl">
          IT IS COMING
        </h1>
        <TheHordeForm />
      </div>
    </div>
  );
}
