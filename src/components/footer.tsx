import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Footer() {
    return (
        <footer className='flex p-8 w-full'>
            <div className='flex gap-6 w-full self-end justify-end'>
                <Link href="#">
                    <div className='w-[48px] h-[48px] flex justify-center items-center rounded-full bg-white-0.1 backdrop-blur-footer-link'>
                        <Image src="/assets/svgs/telegram.svg" width={24} height={24} alt="Telegram"/>
                    </div>
                </Link>
                <Link href="#">
                    <div className='w-[48px] h-[48px] flex justify-center items-center rounded-full bg-white-0.1 backdrop-blur-footer-link'>
                        <Image src="/assets/svgs/github.svg" width={24} height={24} alt="Github"/>
                    </div>
                </Link>
                <Link href="#">
                    <div className='w-[48px] h-[48px] flex justify-center items-center rounded-full bg-white-0.1 backdrop-blur-footer-link'>
                        <Image src="/assets/svgs/twitter.svg" width={24} height={24} alt="Twitter"/>
                    </div>
                </Link>
            </div>
        </footer>
    )
}

export default Footer