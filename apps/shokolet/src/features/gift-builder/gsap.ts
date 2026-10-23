"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

// Register the React plugin once; every animation hook imports gsap from here.
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };
