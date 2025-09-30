import { motion } from 'framer-motion';

const SimpleMexicoOutline = ({ className = "", onRegionClick }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mexico outline path - simplified version matching your image */}
        <motion.path
          d="M 80 200 
             Q 60 180 50 150
             Q 45 120 55 90
             Q 65 60 90 40
             Q 120 20 160 15
             Q 200 10 250 20
             Q 300 30 350 40
             Q 400 50 450 60
             Q 500 70 550 80
             Q 600 90 650 100
             Q 700 110 750 120
             Q 800 130 850 140
             Q 900 150 950 160
             Q 980 170 1000 180
             Q 1020 200 1030 230
             Q 1040 260 1035 290
             Q 1030 320 1020 350
             Q 1010 380 990 400
             Q 970 420 940 430
             Q 910 440 880 445
             Q 850 450 820 455
             Q 790 460 760 465
             Q 730 470 700 475
             Q 670 480 640 485
             Q 610 490 580 495
             Q 550 500 520 505
             Q 490 510 460 515
             Q 430 520 400 525
             Q 370 530 340 535
             Q 310 540 280 545
             Q 250 550 220 555
             Q 190 560 160 565
             Q 130 570 100 575
             Q 70 580 50 590
             Q 30 600 20 610
             Q 10 620 15 630
             Q 20 640 30 650
             Q 40 660 55 665
             Q 70 670 85 675
             Q 100 680 115 685
             Q 130 690 145 695
             Q 160 700 175 705
             Q 190 710 205 715
             Q 220 720 235 725
             Q 250 730 265 735
             Q 280 740 295 745
             Q 310 750 325 755
             Q 340 760 355 765
             Q 370 770 385 775
             Q 400 780 415 785
             Q 430 790 445 795
             Q 460 800 475 805
             Q 490 810 505 815
             Q 520 820 535 825
             Q 550 830 565 835
             Q 580 840 595 845
             Q 610 850 625 855
             Q 640 860 655 865
             Q 670 870 685 875
             Q 700 880 715 885
             Q 730 890 745 895
             Q 760 900 775 905
             Q 790 910 805 915
             Q 820 920 835 925
             Q 850 930 865 935
             Q 880 940 895 945
             Q 910 950 925 955
             Q 940 960 955 965
             Q 970 970 985 975
             Q 1000 980 1015 985
             Q 1030 990 1045 995
             Q 1060 1000 1075 1005
             Q 1090 1010 1105 1015
             Q 1120 1020 1135 1025
             Q 1150 1030 1165 1035
             Q 1180 1040 1195 1045
             Q 1210 1050 1225 1055
             Q 1240 1060 1255 1065
             Q 1270 1070 1285 1075
             Q 1300 1080 1315 1085
             Q 1330 1090 1345 1095
             Q 1360 1100 1375 1105
             Q 1390 1110 1405 1115
             L 50 400
             Q 45 380 50 360
             Q 55 340 65 320
             Q 75 300 80 280
             Q 85 260 80 240
             Q 75 220 80 200 Z"
          stroke="currentColor"
          strokeWidth={3}
          fill="none"
          className="text-black"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            duration: 2, 
            ease: "easeInOut",
            delay: 0.2 
          }}
        />
        
        {/* Optional clickable regions - invisible overlay */}
        {onRegionClick && (
          <>
            {/* Baja California / Los Cabos region */}
            <rect
              x="20"
              y="100"
              width="120"
              height="300"
              fill="transparent"
              className="cursor-pointer hover:fill-black/5"
              onClick={() => onRegionClick('los-cabos')}
            />
            
            {/* Pacific Coast region */}
            <rect
              x="140"
              y="200"
              width="200"
              height="200"
              fill="transparent"
              className="cursor-pointer hover:fill-black/5"
              onClick={() => onRegionClick('pacific-coast')}
            />
            
            {/* Central Mexico region */}
            <rect
              x="340"
              y="180"
              width="200"
              height="180"
              fill="transparent"
              className="cursor-pointer hover:fill-black/5"
              onClick={() => onRegionClick('central-mexico')}
            />
            
            {/* Yucatan Peninsula region */}
            <rect
              x="540"
              y="150"
              width="300"
              height="200"
              fill="transparent"
              className="cursor-pointer hover:fill-black/5"
              onClick={() => onRegionClick('yucatan-peninsula')}
            />
            
            {/* Riviera Maya region */}
            <rect
              x="840"
              y="170"
              width="120"
              height="150"
              fill="transparent"
              className="cursor-pointer hover:fill-black/5"
              onClick={() => onRegionClick('riviera-maya')}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default SimpleMexicoOutline;