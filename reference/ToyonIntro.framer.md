import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react"

import { addPropertyControls, ControlType, RenderTarget } from "framer"

// @ts-ignore - ESM URL import for runtime in Framer

import gsap from "https\://esm.sh/gsap\@3.12.5"

// @ts-ignore - ESM URL import for runtime in Framer

import ScrollTrigger from "https\://esm.sh/gsap\@3.12.5/ScrollTrigger"



/\*

User request:

Create a new code component named ToyonIntro as a full-page, scroll-driven cinematic intro:

Logo hold/zoom, portal-through-first-O transition, cloud transition, and first world reveal.

Use GSAP + ScrollTrigger with cleanup via gsap.context().revert(), static first frame on canvas,

native scroll with sticky stage, no text/UI extras, reduced-motion crossfades, and controls for

logo/background/scroll length/hole geometry/world colors.

\*/



interface ToyonIntroProps {

    logo: { src?: string; srcSet?: string; alt?: string }

    background: string

    scrollLength: number

    holeX: number

    holeY: number

    holeRadius: number

    skyTop: string

    skyBottom: string

    hillFar: string

    hillMid: string

    hillNear: string

}



type WorldSceneProps = {

    skyTop: string

    skyBottom: string

    hillFar: string

    hillMid: string

    hillNear: string

    innerRef?: React.RefObject\<HTMLDivElement | null>

}



function clamp(value: number, min: number, max: number) {

    return Math.max(min, Math.min(max, value))

}



function rangeProgress(value: number, start: number, end: number) {

    if (end <= start) return 0

    return clamp((value - start) / (end - start), 0, 1)

}



function easeInOut(value: number) {

    return value \* value \* (3 - 2 \* value)

}



function buildTimeline(tl: gsap.core.Timeline, state: { progress: number }) {

    tl.to(state, { progress: 1, ease: "none", duration: 1 })

    return tl

}



function IntroSceneLogoZoom(props: {

    logoRef: React.RefObject\<HTMLDivElement | null>

    logoImageRef: React.RefObject\<HTMLImageElement | null>

    logo: { src?: string; srcSet?: string; alt?: string }

}) {

    const { logoRef, logoImageRef, logo } = props

    return (

        \<div

            ref={logoRef}

            style={{

                position: "absolute",

                left: "50%",

                top: "50%",

                transform: "translate(-50%, -50%) scale(1)",

                transformOrigin: "50% 50%",

                zIndex: 30,

                opacity: 1,

                pointerEvents: "none",

            }}

        >

            \<img

                ref={logoImageRef}

                {...logo}

                alt={logo.alt || ""}

                style={{

                    display: "block",

                    width: "100%",

                    height: "auto",

                    objectFit: "contain",

                    aspectRatio: "1600 / 1131",

                    userSelect: "none",

                    pointerEvents: "none",

                }}

            />

        \</div>

    )

}



function FirstWorldScene(props: WorldSceneProps) {

    const { skyTop, skyBottom, hillFar, hillMid, hillNear, innerRef } = props

    return (

        \<div

            ref={innerRef}

            style={{

                position: "absolute",

                inset: 0,

                overflow: "hidden",

            }}

        >

            \<div

                style={{

                    position: "absolute",

                    inset: 0,

                    background: \`linear-gradient(180deg, ${skyTop} 0%, ${skyBottom} 72%)\`,

                }}

            />

            \<div

                style={{

                    position: "absolute",

                    width: "55vmin",

                    height: "55vmin",

                    borderRadius: "50%",

                    left: "56%",

                    top: "24%",

                    transform: "translate(-50%, -50%)",

                    background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0) 75%)",

                }}

            />

            \<div

                style={{

                    position: "absolute",

                    left: "10%",

                    top: "16%",

                    width: "80%",

                    height: "28%",

                    opacity: 0.28,

                    background:

                        "radial-gradient(ellipse at 20% 58%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 66%), radial-gradient(ellipse at 68% 42%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 65%), radial-gradient(ellipse at 90% 65%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",

                }}

            />

            \<svg viewBox="0 0 1000 350" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: "31%", width: "100%", height: "36%" }}>

                \<path d="M0,224 C116,180 215,148 349,180 C470,210 547,154 680,136 C803,120 905,163 1000,132 L1000,350 L0,350 Z" fill={hillFar} />

            \</svg>

            \<svg viewBox="0 0 1000 350" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: "17%", width: "100%", height: "40%" }}>

                \<path d="M0,240 C108,191 221,196 326,218 C475,252 539,183 696,171 C849,161 933,193 1000,174 L1000,350 L0,350 Z" fill={hillMid} />

            \</svg>

            \<svg viewBox="0 0 1000 350" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: "48%" }}>

                \<path d="M0,224 C156,231 255,190 384,211 C530,235 648,198 755,187 C856,177 944,207 1000,202 L1000,350 L0,350 Z" fill={hillNear} />

            \</svg>

            \<div

                style={{

                    position: "absolute",

                    inset: 0,

                    background: "linear-gradient(180deg, rgba(255,255,255,0) 54%, rgba(255,255,255,0.18) 100%)",

                    pointerEvents: "none",

                }}

            />

            \<div data-slot="product-1" style={{ position: "absolute", left: "24%", bottom: "17%", width: "11%", height: "10%", borderRadius: "50%", background: "rgba(0,0,0,0.03)" }} />

            \<div data-slot="product-2" style={{ position: "absolute", left: "45%", bottom: "18%", width: "12%", height: "11%", borderRadius: "50%", background: "rgba(0,0,0,0.03)" }} />

            \<div data-slot="product-3" style={{ position: "absolute", left: "66%", bottom: "16%", width: "10%", height: "9%", borderRadius: "50%", background: "rgba(0,0,0,0.03)" }} />

        \</div>

    )

}



function OPortalTransition(props: {

    portalRef: React.RefObject\<HTMLDivElement | null>

    worldInnerRef: React.RefObject\<HTMLDivElement | null>

    skyTop: string

    skyBottom: string

    hillFar: string

    hillMid: string

    hillNear: string

}) {

    const { portalRef, worldInnerRef, skyTop, skyBottom, hillFar, hillMid, hillNear } = props

    return (

        \<div

            ref={portalRef}

            style={{

                position: "absolute",

                inset: 0,

                zIndex: 40,

                opacity: 1,

                clipPath: "circle(0px at 50% 50%)",

                pointerEvents: "none",

            }}

        >

            \<FirstWorldScene skyTop={skyTop} skyBottom={skyBottom} hillFar={hillFar} hillMid={hillMid} hillNear={hillNear} innerRef={worldInnerRef} />

        \</div>

    )

}



function CloudTransition(props: {

    cloudBackRef: React.RefObject\<HTMLDivElement | null>

    cloudMidRef: React.RefObject\<HTMLDivElement | null>

    cloudFrontRef: React.RefObject\<HTMLDivElement | null>

    mobile: boolean

}) {

    const { cloudBackRef, cloudMidRef, cloudFrontRef, mobile } = props

    const layerStyle = useMemo(

        () => ({

            position: "absolute" as const,

            inset: 0,

            zIndex: 50,

            opacity: 0,

            pointerEvents: "none" as const,

            willChange: "transform, opacity",

        }),

        []

    )

    const puffStyle = useMemo(

        () => ({

            position: "absolute" as const,

            borderRadius: "50%",

            background: "radial-gradient(circle at 42% 42%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.82) 55%, rgba(255,255,255,0) 100%)",

        }),

        []

    )



    const backPuffs = mobile

        ? [

              { left: "8%", top: "24%", size: 160 },

              { left: "66%", top: "18%", size: 170 },

              { left: "30%", top: "58%", size: 180 },

          ]

        : [

              { left: "5%", top: "18%", size: 180 },

              { left: "22%", top: "52%", size: 220 },

              { left: "62%", top: "14%", size: 210 },

              { left: "78%", top: "46%", size: 210 },

          ]

    const midPuffs = mobile

        ? [

              { left: "0%", top: "42%", size: 190 },

              { left: "58%", top: "34%", size: 180 },

              { left: "38%", top: "68%", size: 160 },

          ]

        : [

              { left: "-2%", top: "34%", size: 260 },

              { left: "18%", top: "8%", size: 220 },

              { left: "56%", top: "28%", size: 230 },

              { left: "82%", top: "14%", size: 220 },

          ]

    const frontPuffs = mobile

        ? [

              { left: "10%", top: "64%", size: 220 },

              { left: "72%", top: "56%", size: 200 },

          ]

        : [

              { left: "8%", top: "62%", size: 300 },

              { left: "40%", top: "60%", size: 260 },

              { left: "74%", top: "56%", size: 300 },

          ]



    return (

        <>

            \<div ref={cloudBackRef} style={layerStyle}>

                {backPuffs.map((puff, index) => (

                    \<div key={\`back-${index}\`} style={{ ...puffStyle, left: puff.left, top: puff.top, width: puff.size, height: puff.size }} />

                ))}

            \</div>

            \<div ref={cloudMidRef} style={layerStyle}>

                {midPuffs.map((puff, index) => (

                    \<div key={\`mid-${index}\`} style={{ ...puffStyle, left: puff.left, top: puff.top, width: puff.size, height: puff.size }} />

                ))}

            \</div>

            \<div

                ref={cloudFrontRef}

                style={{

                    ...layerStyle,

                    filter: mobile ? "none" : "blur(8px)",

                }}

            >

                {frontPuffs.map((puff, index) => (

                    \<div key={\`front-${index}\`} style={{ ...puffStyle, left: puff.left, top: puff.top, width: puff.size, height: puff.size }} />

                ))}

            \</div>

        \</>

    )

}



/\*\*

 \* @framerSupportedLayoutWidth any-prefer-fixed

 \* @framerSupportedLayoutHeight auto

 \*/

export default function ToyonIntro(props: ToyonIntroProps) {

    const {

        logo = { src: "https\://framerusercontent.com/images/ebgGO8GjKqyo1ztwCBrqRJJHbA.jpeg", alt: "Toyon logo artwork" },

        background,

        scrollLength,

        holeX,

        holeY,

        holeRadius,

        skyTop,

        skyBottom,

        hillFar,

        hillMid,

        hillNear,

    } = props



    const rootRef = useRef\<HTMLDivElement | null>(null)

    const stageRef = useRef\<HTMLDivElement | null>(null)

    const logoRef = useRef\<HTMLDivElement | null>(null)

    const logoImageRef = useRef\<HTMLImageElement | null>(null)

    const portalRef = useRef\<HTMLDivElement | null>(null)

    const portalWorldInnerRef = useRef\<HTMLDivElement | null>(null)

    const fullWorldRef = useRef\<HTMLDivElement | null>(null)

    const fullWorldInnerRef = useRef\<HTMLDivElement | null>(null)

    const cloudBackRef = useRef\<HTMLDivElement | null>(null)

    const cloudMidRef = useRef\<HTMLDivElement | null>(null)

    const cloudFrontRef = useRef\<HTMLDivElement | null>(null)



    const [viewport, setViewport] = useState({ width: 1280, height: 720 })



    useEffect(() => {

        if (typeof window !== "undefined") {

            const onResize = () => {

                startTransition(() => {

                    setViewport({ width: window\.innerWidth, height: window\.innerHeight })

                })

            }

            onResize()

            window\.addEventListener("resize", onResize)

            return () => window\.removeEventListener("resize", onResize)

        }

        return

    }, [])



    const isMobile = viewport.width < 768

    const isCanvas = RenderTarget.current() === RenderTarget.canvas



    const renderFrame = useCallback(

        (progress: number, reducedMotion: boolean) => {

            const logoEl = logoRef.current

            const portalEl = portalRef.current

            const portalWorldInnerEl = portalWorldInnerRef.current

            const fullWorldEl = fullWorldRef.current

            const fullWorldInnerEl = fullWorldInnerRef.current

            const cloudBackEl = cloudBackRef.current

            const cloudMidEl = cloudMidRef.current

            const cloudFrontEl = cloudFrontRef.current

            if (!logoEl || !portalEl || !portalWorldInnerEl || !fullWorldEl || !fullWorldInnerEl || !cloudBackEl || !cloudMidEl || !cloudFrontEl) return



            const vw = Math.max(1, viewport.width)

            const vh = Math.max(1, viewport.height)

            const diagonal = Math.hypot(vw, vh)

            const baseWidth = Math.min(vw \* 0.86, 900)

            const baseHeight = baseWidth / (1600 / 1131)



            let scale = 1

            const zoomProgress = easeInOut(rangeProgress(progress, 0, 0.3))

            const approachProgress = easeInOut(rangeProgress(progress, 0.3, 0.58))

            const minTarget = 60

            const maxTarget = 120

            const computedTarget = (diagonal \* 0.56) / Math.max(0.0001, holeRadius \* baseWidth)

            const targetScale = clamp(computedTarget, minTarget, maxTarget)

            scale = 1 + (3 - 1) \* zoomProgress

            if (progress > 0.35) {

                scale = 3 \* Math.pow(targetScale / 3, approachProgress)

            }

            if (progress > 0.58) scale = targetScale



            const holeOffsetX = (holeX - 0.5) \* baseWidth \* scale

            const holeOffsetY = (holeY - 0.5) \* baseHeight \* scale

            const alignProgress = easeInOut(rangeProgress(progress, 0.1, 0.55))

            const translateX = -holeOffsetX \* alignProgress

            const translateY = -holeOffsetY \* alignProgress

            const holeScreenX = vw / 2 + holeOffsetX + translateX

            const holeScreenY = vh / 2 + holeOffsetY + translateY

            const holeScreenRadius = holeRadius \* baseWidth \* scale



            if (reducedMotion) {

                const logoFade = 1 - rangeProgress(progress, 0.42, 0.66)

                const worldFade = rangeProgress(progress, 0.62, 0.82)

                gsap.set(logoEl, { width: baseWidth, xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, opacity: logoFade })

                gsap.set(portalEl, { clipPath: "circle(0px at 50% 50%)", opacity: 0 })

                gsap.set(portalWorldInnerEl, { scale: 1 })

                gsap.set(fullWorldEl, { opacity: worldFade })

                gsap.set(fullWorldInnerEl, { y: 0, scale: 1 })

                gsap.set(cloudBackEl, { opacity: 0, scale: 1, x: 0 })

                gsap.set(cloudMidEl, { opacity: 0, scale: 1, x: 0 })

                gsap.set(cloudFrontEl, { opacity: 0, scale: 1, x: 0 })

                return

            }



            const logoOpacity = holeScreenRadius > diagonal \* 0.6 ? 0 : 1

            gsap.set(logoEl, {

                width: baseWidth,

                xPercent: -50,

                yPercent: -50,

                x: translateX,

                y: translateY,

                scale,

                opacity: logoOpacity,

            })



            gsap.set(portalEl, {

                clipPath: \`circle(${holeScreenRadius}px at ${holeScreenX}px ${holeScreenY}px)\`,

                opacity: progress < 0.9 ? 1 : 1 - rangeProgress(progress, 0.9, 1),

            })

            gsap.set(portalWorldInnerEl, {

                scale: 1.4 - 0.4 \* easeInOut(rangeProgress(progress, 0.3, 0.72)),

                transformOrigin: \`${holeScreenX}px ${holeScreenY}px\`,

            })



            const worldReveal = easeInOut(rangeProgress(progress, 0.72, 1))

            gsap.set(fullWorldEl, { opacity: worldReveal })

            gsap.set(fullWorldInnerEl, {

                y: (1 - worldReveal) \* 26,

                scale: 1.03 - worldReveal \* 0.03,

            })



            const cloudIn = easeInOut(rangeProgress(progress, 0.52, 0.72))

            const cloudOut = easeInOut(rangeProgress(progress, 0.74, 0.88))

            const baseCloudOpacity = cloudIn \* (1 - cloudOut)

            gsap.set(cloudBackEl, {

                opacity: baseCloudOpacity \* 0.85,

                x: -130 \* cloudOut,

                y: 46 \* (1 - cloudIn),

                scale: 0.86 + cloudIn \* 0.6 + cloudOut \* 0.45,

            })

            gsap.set(cloudMidEl, {

                opacity: baseCloudOpacity,

                x: 160 \* cloudOut,

                y: 70 \* (1 - cloudIn),

                scale: 0.82 + cloudIn \* 0.78 + cloudOut \* 0.52,

            })

            gsap.set(cloudFrontEl, {

                opacity: baseCloudOpacity,

                x: -220 \* cloudOut,

                y: 96 \* (1 - cloudIn),

                scale: 0.8 + cloudIn \* 0.95 + cloudOut \* 0.65,

            })

        },

        [holeRadius, holeX, holeY, viewport.height, viewport.width]

    )



    useEffect(() => {

        if (isCanvas) {

            renderFrame(0, true)

            return

        }

        if (typeof window === "undefined") return

        if (!rootRef.current || !stageRef.current) return



        gsap.registerPlugin(ScrollTrigger)



        const mediaQuery = window\.matchMedia("(prefers-reduced-motion: reduce)")

        const reducedMotion = mediaQuery.matches



        const state = { progress: 0 }

        const context = gsap.context(() => {

            const stageEl = stageRef.current

            const rootEl = rootRef.current

            if (!stageEl || !rootEl) return

            let forceFixedPin = false

            const applyStageMode = (mode: "sticky" | "fixed" | "absolute-end") => {

                if (!stageEl) return

                if (mode === "fixed") {

                    gsap.set(stageEl, {

                        position: "fixed",

                        inset: "0px",

                        top: 0,

                        left: 0,

                        right: 0,

                        bottom: 0,

                        width: "100%",

                        height: "100vh",

                    })

                    return

                }

                if (mode === "absolute-end") {

                    gsap.set(stageEl, {

                        position: "absolute",

                        inset: "auto 0px 0px 0px",

                        top: "auto",

                        left: 0,

                        right: 0,

                        bottom: 0,

                        width: "100%",

                        height: "100vh",

                    })

                    return

                }

                gsap.set(stageEl, {

                    position: "sticky",

                    inset: "auto",

                    top: 0,

                    left: "auto",

                    right: "auto",

                    bottom: "auto",

                    width: "100%",

                    height: "100vh",

                })

            }

            renderFrame(0, reducedMotion)

            const timeline = buildTimeline(gsap.timeline(), state)

            timeline.eventCallback("onUpdate", () => {

                renderFrame(state.progress, reducedMotion)

            })

            ScrollTrigger.create({

                animation: timeline,

                trigger: rootEl,

                start: "top top",

                end: "bottom bottom",

                scrub: 1,

                invalidateOnRefresh: true,

                onUpdate: (self) => {

                    const stageRect = stageEl.getBoundingClientRect()

                    const rootRect = rootEl.getBoundingClientRect()

                    const inRootRange = rootRect.top <= 0 && rootRect.bottom >= window\.innerHeight

                    if (self.isActive && inRootRange && !forceFixedPin && Math.abs(stageRect.top) > 2) {

                        forceFixedPin = true

                    }

                    if (self.isActive) {

                        applyStageMode(forceFixedPin ? "fixed" : "sticky")

                    } else if (self.progress >= 1) {

                        applyStageMode("absolute-end")

                        forceFixedPin = false

                    } else {

                        applyStageMode("sticky")

                        forceFixedPin = false

                    }

                },

                onToggle: (self) => {

                    if (self.isActive) {

                        applyStageMode(forceFixedPin ? "fixed" : "sticky")

                    } else if (self.progress >= 1) {

                        applyStageMode("absolute-end")

                        forceFixedPin = false

                    } else {

                        applyStageMode("sticky")

                        forceFixedPin = false

                    }

                },

                onRefresh: () => {

                    renderFrame(state.progress, reducedMotion)

                    applyStageMode("sticky")

                },

            })

            window\.setTimeout(() => {

                ScrollTrigger.refresh()

            }, 100)

        }, stageRef)



        const imgEl = logoImageRef.current

        const onLogoReady = () => ScrollTrigger.refresh()

        if (imgEl) {

            if (imgEl.complete) {

                onLogoReady()

            } else {

                imgEl.addEventListener("load", onLogoReady)

            }

        }



        return () => {

            if (imgEl) imgEl.removeEventListener("load", onLogoReady)

            context.revert()

        }

    }, [isCanvas, renderFrame])



    const rootHeight = useMemo(() => \`${Math.max(100, scrollLength \* 100)}vh\`, [scrollLength])



    return (

        \<div

            ref={rootRef}

            style={{

                position: "relative",

                width: "100%",

                height: rootHeight,

                overflow: "clip",

                background,

            }}

        >

            \<div

                ref={stageRef}

                style={{

                    position: "sticky",

                    top: 0,

                    width: "100%",

                    height: "100vh",

                    minHeight: "100svh",

                    overflow: "hidden",

                    background,

                }}

            >

                \<div ref={fullWorldRef} style={{ position: "absolute", inset: 0, zIndex: 10, opacity: 0, pointerEvents: "none" }}>

                    \<FirstWorldScene skyTop={skyTop} skyBottom={skyBottom} hillFar={hillFar} hillMid={hillMid} hillNear={hillNear} innerRef={fullWorldInnerRef} />

                \</div>

                \<OPortalTransition

                    portalRef={portalRef}

                    worldInnerRef={portalWorldInnerRef}

                    skyTop={skyTop}

                    skyBottom={skyBottom}

                    hillFar={hillFar}

                    hillMid={hillMid}

                    hillNear={hillNear}

                />

                \<IntroSceneLogoZoom logoRef={logoRef} logoImageRef={logoImageRef} logo={logo} />

                \<CloudTransition cloudBackRef={cloudBackRef} cloudMidRef={cloudMidRef} cloudFrontRef={cloudFrontRef} mobile={isMobile} />

            \</div>

        \</div>

    )

}



addPropertyControls(ToyonIntro, {

    logo: {

        type: ControlType.ResponsiveImage,

        title: "Logo",

    },

    background: {

        type: ControlType.Color,

        title: "Background",

        defaultValue: "#FFFFFF",

    },

    scrollLength: {

        type: ControlType.Number,

        title: "Scroll",

        defaultValue: 5,

        min: 2,

        max: 12,

        step: 0.5,

        unit: "vh x100",

    },

    holeX: {

        type: ControlType.Number,

        title: "Hole X",

        defaultValue: 0.348,

        min: 0,

        max: 1,

        step: 0.001,

    },

    holeY: {

        type: ControlType.Number,

        title: "Hole Y",

        defaultValue: 0.477,

        min: 0,

        max: 1,

        step: 0.001,

    },

    holeRadius: {

        type: ControlType.Number,

        title: "Hole R",

        defaultValue: 0.028,

        min: 0.005,

        max: 0.2,

        step: 0.001,

    },

    skyTop: {

        type: ControlType.Color,

        title: "Sky Top",

        defaultValue: "#C9E9FF",

    },

    skyBottom: {

        type: ControlType.Color,

        title: "Sky Bottom",

        defaultValue: "#F2F6D8",

    },

    hillFar: {

        type: ControlType.Color,

        title: "Hill Far",

        defaultValue: "#AFCFB5",

    },

    hillMid: {

        type: ControlType.Color,

        title: "Hill Mid",

        defaultValue: "#88BC80",

    },

    hillNear: {

        type: ControlType.Color,

        title: "Hill Near",

        defaultValue: "#5D9C5E",

    },

})