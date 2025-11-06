import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  imageSrc?: string
  imageAlt?: string
  width?: number
  height?: number
  title?: string
}

export function Logo({ 
  imageSrc = "/logo.svg",
  imageAlt = "Web Companion Logo",
  width = 32,
  height = 32,
  title = "Web Companion"
}: LogoProps) {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image 
        src={imageSrc} 
        alt={imageAlt} 
        width={width} 
        height={height}
        className="object-contain"
      />
      <span className="font-bold text-xl">{title}</span>
    </Link>
  )
} 