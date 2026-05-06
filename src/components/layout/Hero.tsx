import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full aspect-[1920/600] max-h-[600px]">
        <Image
          src="/hero-banner.jpg"
          alt="推薦好物，用心分享"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
    </section>
  )
}
