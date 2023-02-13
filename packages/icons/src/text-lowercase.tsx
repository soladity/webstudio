import * as React from "react";
import type { IconProps } from "./types";

export const TextLowercaseIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, forwardedRef) => {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
      >
        <path
          d="M2.30954 6.49619C2.05591 6.75023 2.05624 7.16179 2.31028 7.41543C2.56432 7.66907 2.97588 7.66874 3.22952 7.41469L2.30954 6.49619ZM6.43651 7.34753L5.83409 7.59164L5.84732 7.62431L5.86402 7.65535L6.43651 7.34753ZM5.63107 8.80987L5.48413 8.17669L5.63107 8.80987ZM2.25432 10.8719L2.90291 10.829L2.25432 10.8719ZM9.30955 6.49619C9.05591 6.75023 9.05624 7.16179 9.31028 7.41543C9.56432 7.66907 9.97588 7.66874 10.2295 7.41469L9.30955 6.49619ZM13.4365 7.34753L12.8341 7.59164L12.8473 7.62431L12.864 7.65535L13.4365 7.34753ZM12.6311 8.80987L12.4841 8.17669L12.6311 8.80987ZM9.25432 10.8719L9.90291 10.829L9.25432 10.8719ZM3.22952 7.41469C3.20001 7.44425 3.21633 7.41976 3.34313 7.36129C3.44938 7.31229 3.59078 7.25864 3.7522 7.20884C4.08516 7.1061 4.43317 7.0411 4.66674 7.0411V5.7411C4.25235 5.7411 3.76563 5.84422 3.36891 5.96663C3.16548 6.02939 2.96831 6.10257 2.79873 6.18077C2.64969 6.2495 2.45292 6.35258 2.30954 6.49619L3.22952 7.41469ZM4.66674 7.0411C5.20527 7.0411 5.46393 7.16087 5.58874 7.25105C5.71235 7.34036 5.77762 7.4523 5.83409 7.59164L7.03893 7.10342C6.93857 6.85576 6.75444 6.48949 6.35011 6.19733C5.94697 5.90605 5.39915 5.7411 4.66674 5.7411V7.0411ZM5.86402 7.65535C5.8397 7.61012 5.8394 7.58969 5.84905 7.6311C5.85641 7.66267 5.86548 7.71242 5.87496 7.78344C5.89386 7.9251 5.90975 8.11552 5.92226 8.34483L7.22033 8.27401C7.20701 8.02978 7.18887 7.80132 7.16353 7.61146C7.15089 7.51672 7.13528 7.42254 7.11514 7.33611C7.09729 7.25951 7.06669 7.147 7.00899 7.0397L5.86402 7.65535ZM5.92226 8.34483C5.95951 9.02755 5.96198 9.95707 5.95493 10.7138L7.25488 10.7259C7.26195 9.96608 7.26001 9.00115 7.22033 8.27401L5.92226 8.34483ZM5.95493 10.7138C5.95158 11.0743 5.94611 11.3919 5.94148 11.6192C5.93917 11.7329 5.93707 11.8239 5.93555 11.8863C5.93479 11.9175 5.93418 11.9416 5.93376 11.9578C5.93355 11.9659 5.93338 11.972 5.93327 11.9761C5.93322 11.9781 5.93318 11.9796 5.93315 11.9806C5.93314 11.9811 5.93313 11.9815 5.93312 11.9817C5.93312 11.9818 5.93312 11.9819 5.93312 11.9819C5.93312 11.982 5.93312 11.982 5.93312 11.982C5.93311 11.982 5.93312 11.982 5.93311 11.982C5.93312 11.982 5.93312 11.982 6.58287 11.9999C7.23262 12.0178 7.23262 12.0178 7.23262 12.0178C7.23262 12.0178 7.23262 12.0178 7.23262 12.0178C7.23262 12.0178 7.23262 12.0177 7.23262 12.0177C7.23263 12.0176 7.23263 12.0175 7.23263 12.0173C7.23264 12.017 7.23266 12.0166 7.23267 12.016C7.2327 12.0148 7.23275 12.0132 7.23281 12.011C7.23292 12.0066 7.2331 12.0001 7.23332 11.9916C7.23376 11.9747 7.23439 11.9499 7.23517 11.9179C7.23672 11.8539 7.23886 11.7612 7.24121 11.6457C7.24591 11.4147 7.25147 11.0922 7.25488 10.7259L5.95493 10.7138ZM6.59447 8.27827C6.0446 7.93166 6.04463 7.9316 6.04467 7.93154C6.04468 7.93152 6.04472 7.93146 6.04475 7.93142C6.0448 7.93134 6.04485 7.93126 6.04489 7.93119C6.04499 7.93103 6.04509 7.93087 6.04519 7.93072C6.04539 7.9304 6.04559 7.93009 6.04578 7.92979C6.04617 7.92917 6.04656 7.92857 6.04694 7.92798C6.04769 7.92679 6.04843 7.92565 6.04915 7.92454C6.05059 7.92233 6.05194 7.92029 6.0532 7.9184C6.05573 7.91463 6.05791 7.91149 6.05973 7.90894C6.06337 7.90385 6.06554 7.90112 6.06609 7.90043L7.0765 8.71841C7.09303 8.69799 7.10679 8.67968 7.11802 8.66394C7.12364 8.65607 7.12862 8.64884 7.13299 8.64231C7.13518 8.63905 7.13722 8.63596 7.13911 8.63305C7.14006 8.63159 7.14097 8.63019 7.14184 8.62882C7.14228 8.62814 7.1427 8.62747 7.14312 8.62681C7.14333 8.62648 7.14354 8.62616 7.14374 8.62583C7.14384 8.62567 7.14395 8.62551 7.14405 8.62535C7.1441 8.62527 7.14415 8.62519 7.1442 8.62511C7.14422 8.62507 7.14426 8.62501 7.14427 8.62499C7.14431 8.62493 7.14435 8.62487 6.59447 8.27827ZM6.0661 7.90043C6.07733 7.88656 5.93903 8.07113 5.48413 8.17669L5.778 9.44304C6.5332 9.26779 6.9176 8.91469 7.0765 8.71841L6.0661 7.90043ZM5.48413 8.17669C5.28566 8.22275 5.01188 8.25242 4.59921 8.3158C4.2205 8.37397 3.76945 8.45594 3.34114 8.6022C2.91711 8.74698 2.46083 8.97259 2.11776 9.35259C1.75568 9.75364 1.56367 10.2786 1.60574 10.9148L2.90291 10.829C2.88294 10.5271 2.967 10.3519 3.08269 10.2237C3.21738 10.0746 3.44054 9.94195 3.76122 9.83245C4.0776 9.72442 4.43651 9.65604 4.79657 9.60074C5.12268 9.55065 5.51649 9.50373 5.778 9.44304L5.48413 8.17669ZM1.60574 10.9148C1.67016 11.889 2.54267 12.5005 3.5233 12.5904C4.53081 12.6828 5.76702 12.2796 7.02459 11.2162L6.18521 10.2235C5.11229 11.1308 4.20921 11.3479 3.64204 11.2959C3.04801 11.2414 2.91048 10.9436 2.90291 10.829L1.60574 10.9148ZM7.02459 11.2162C7.07687 11.172 7.12922 11.1267 7.18163 11.0801L6.31837 10.1081C6.27374 10.1477 6.22935 10.1862 6.18521 10.2235L7.02459 11.2162ZM10.2295 7.41469C10.2 7.44425 10.2163 7.41976 10.3431 7.36129C10.4494 7.31229 10.5908 7.25864 10.7522 7.20884C11.0852 7.1061 11.4332 7.0411 11.6667 7.0411V5.7411C11.2523 5.7411 10.7656 5.84422 10.3689 5.96663C10.1655 6.02939 9.96831 6.10257 9.79873 6.18077C9.64969 6.2495 9.45292 6.35258 9.30955 6.49619L10.2295 7.41469ZM11.6667 7.0411C12.2053 7.0411 12.4639 7.16087 12.5887 7.25105C12.7123 7.34036 12.7776 7.4523 12.8341 7.59164L14.0389 7.10342C13.9386 6.85576 13.7544 6.48949 13.3501 6.19733C12.947 5.90605 12.3992 5.7411 11.6667 5.7411V7.0411ZM12.864 7.65535C12.8397 7.61012 12.8394 7.58969 12.8491 7.6311C12.8564 7.66267 12.8655 7.71242 12.875 7.78344C12.8939 7.9251 12.9098 8.11552 12.9223 8.34483L14.2203 8.27401C14.207 8.02978 14.1889 7.80132 14.1635 7.61146C14.1509 7.51672 14.1353 7.42254 14.1151 7.33611C14.0973 7.25951 14.0667 7.147 14.009 7.0397L12.864 7.65535ZM12.9223 8.34483C12.9595 9.02755 12.962 9.95707 12.9549 10.7138L14.2549 10.7259C14.2619 9.96608 14.26 9.00115 14.2203 8.27401L12.9223 8.34483ZM12.9549 10.7138C12.9516 11.0743 12.9461 11.3919 12.9415 11.6192C12.9392 11.7329 12.9371 11.8239 12.9356 11.8863C12.9348 11.9175 12.9342 11.9416 12.9338 11.9578C12.9335 11.9659 12.9334 11.972 12.9333 11.9761C12.9332 11.9781 12.9332 11.9796 12.9332 11.9806C12.9331 11.9811 12.9331 11.9815 12.9331 11.9817C12.9331 11.9818 12.9331 11.9819 12.9331 11.9819C12.9331 11.982 12.9331 11.982 12.9331 11.982C12.9331 11.982 12.9331 11.982 12.9331 11.982C12.9331 11.982 12.9331 11.982 13.5829 11.9999C14.2326 12.0178 14.2326 12.0178 14.2326 12.0178C14.2326 12.0178 14.2326 12.0178 14.2326 12.0178C14.2326 12.0178 14.2326 12.0177 14.2326 12.0177C14.2326 12.0176 14.2326 12.0175 14.2326 12.0173C14.2326 12.017 14.2327 12.0166 14.2327 12.016C14.2327 12.0148 14.2327 12.0132 14.2328 12.011C14.2329 12.0066 14.2331 12.0001 14.2333 11.9916C14.2338 11.9747 14.2344 11.9499 14.2352 11.9179C14.2367 11.8539 14.2389 11.7612 14.2412 11.6457C14.2459 11.4147 14.2515 11.0922 14.2549 10.7259L12.9549 10.7138ZM13.5945 8.27827C13.0446 7.93166 13.0446 7.9316 13.0447 7.93154C13.0447 7.93152 13.0447 7.93146 13.0447 7.93142C13.0448 7.93134 13.0448 7.93126 13.0449 7.93119C13.045 7.93103 13.0451 7.93087 13.0452 7.93072C13.0454 7.9304 13.0456 7.93009 13.0458 7.92979C13.0462 7.92917 13.0466 7.92857 13.0469 7.92798C13.0477 7.92679 13.0484 7.92565 13.0492 7.92454C13.0506 7.92233 13.0519 7.92029 13.0532 7.9184C13.0557 7.91463 13.0579 7.91149 13.0597 7.90894C13.0634 7.90385 13.0655 7.90112 13.0661 7.90043L14.0765 8.71841C14.093 8.69799 14.1068 8.67968 14.118 8.66394C14.1236 8.65607 14.1286 8.64884 14.133 8.64231C14.1352 8.63905 14.1372 8.63596 14.1391 8.63305C14.1401 8.63159 14.141 8.63019 14.1418 8.62882C14.1423 8.62814 14.1427 8.62747 14.1431 8.62681C14.1433 8.62648 14.1435 8.62616 14.1437 8.62583C14.1438 8.62567 14.1439 8.62551 14.144 8.62535C14.1441 8.62527 14.1441 8.62519 14.1442 8.62511C14.1442 8.62507 14.1443 8.62501 14.1443 8.62499C14.1443 8.62493 14.1443 8.62487 13.5945 8.27827ZM13.0661 7.90043C13.0773 7.88656 12.939 8.07113 12.4841 8.17669L12.778 9.44304C13.5332 9.26779 13.9176 8.91469 14.0765 8.71841L13.0661 7.90043ZM12.4841 8.17669C12.2857 8.22275 12.0119 8.25242 11.5992 8.3158C11.2205 8.37397 10.7695 8.45594 10.3411 8.6022C9.91711 8.74698 9.46083 8.97259 9.11776 9.35259C8.75568 9.75364 8.56367 10.2786 8.60574 10.9148L9.90291 10.829C9.88294 10.5271 9.967 10.3519 10.0827 10.2237C10.2174 10.0746 10.4405 9.94195 10.7612 9.83245C11.0776 9.72442 11.4365 9.65604 11.7966 9.60074C12.1227 9.55065 12.5165 9.50373 12.778 9.44304L12.4841 8.17669ZM8.60574 10.9148C8.67016 11.889 9.54267 12.5005 10.5233 12.5904C11.5308 12.6828 12.767 12.2796 14.0246 11.2162L13.1852 10.2235C12.1123 11.1308 11.2092 11.3479 10.642 11.2959C10.048 11.2414 9.91048 10.9436 9.90291 10.829L8.60574 10.9148ZM14.0246 11.2162C14.0769 11.172 14.1292 11.1267 14.1816 11.0801L13.3184 10.1081C13.2737 10.1477 13.2294 10.1862 13.1852 10.2235L14.0246 11.2162Z"
          fill={color}
        />
      </svg>
    );
  }
);
TextLowercaseIcon.displayName = "TextLowercaseIcon";
