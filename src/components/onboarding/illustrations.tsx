import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { colors, fonts } from "../../theme/colors";

type Props = { size?: number };

// Hand-drawn flat-vector illustrations (not raster photos, not auto-traced
// from one) - every shape here is a plain Rect/Circle/Path, so it stays
// crisp at any size and there's no background/halo to strip, unlike the
// photo assets this replaces. Rendered to PNG and visually checked (a
// plain-SVG mirror of this exact markup is a faithful proxy for what
// react-native-svg renders) before being wired in - the first pass had the
// storefront's sign hidden behind its own awning (z-order bug) and the
// scooter's white body invisible against a same-color test swatch, both
// fixed here.
//
// All three share one 240x240 viewBox so they size uniformly as a group,
// unlike the photos (which each had their own cropped aspect ratio).
const VIEW = 240;

export function NearestStoreIllustration({ size = VIEW }: Props) {
  const stroke = { stroke: colors.onSurface, strokeWidth: 2.2 };
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`}>
      <Line x1={26} y1={210} x2={214} y2={210} stroke={colors.onSurface} strokeWidth={2} />

      {/* pin */}
      <Path
        d="M120 22 C103 22 90 35 90 52 C90 76 120 102 120 102 C120 102 150 76 150 52 C150 35 137 22 120 22 Z"
        fill={colors.secondaryContainer}
        {...stroke}
      />
      <Circle cx={120} cy={52} r={10} fill={colors.surface} stroke={colors.onSurface} strokeWidth={1.6} />

      {/* awning stripes, drawn before the sign so the sign sits on top */}
      <Path
        d="M56 130 L184 130 L184 110 Q184 100 174 100 L66 100 Q56 100 56 110 Z"
        fill={colors.tertiaryContainer}
        {...stroke}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x0 = 56 + i * 21.3;
        return (
          <Rect
            key={i}
            x={x0}
            y={105}
            width={10.7}
            height={19}
            fill={i % 2 === 0 ? colors.surface : colors.tertiaryContainer}
          />
        );
      })}
      <Path
        d="M56 130 Q62 138 68 130 Q74 138 80 130 Q86 138 92 130 Q98 138 104 130 Q110 138 116 130 Q122 138 128 130 Q134 138 140 130 Q146 138 152 130 Q158 138 164 130 Q170 138 176 130 Q182 138 184 130 L184 130 L56 130 Z"
        fill={colors.tertiaryContainer}
      />

      {/* sign badge, on top of the awning */}
      <Rect x={84} y={88} width={72} height={26} rx={6} fill={colors.surface} {...stroke} />
      <SvgText
        x={120}
        y={106}
        fontFamily={fonts.display.extraBold}
        fontSize={15}
        fill={colors.onSurface}
        textAnchor="middle"
      >
        X-SHA
      </SvgText>

      {/* body */}
      <Rect x={62} y={130} width={116} height={72} fill={colors.surface} {...stroke} />
      <Rect x={62} y={194} width={116} height={8} fill={colors.secondary} />

      {/* door */}
      <Rect x={72} y={156} width={28} height={46} rx={2} fill={colors.surface} {...stroke} />
      <Circle cx={91} cy={180} r={1.8} fill={colors.onSurface} />

      {/* window */}
      <Rect x={112} y={146} width={56} height={48} rx={3} fill={colors.primaryFixed} {...stroke} />
      <Path d="M118 146 L136 194" stroke={colors.onSurface} strokeWidth={2} opacity={0.3} />
      <Path d="M132 156 L132 162" stroke={colors.onSurface} strokeWidth={1.6} />
      <Path d="M126 162 Q132 156 138 162" fill="none" stroke={colors.onSurface} strokeWidth={1.6} />
      <Path d="M124 164 L140 164 L146 184 L118 184 Z" fill={colors.secondary} />
      <Path d="M150 176 L163 176 L160 188 L150 188 Z" fill={colors.tertiaryContainer} stroke={colors.onSurface} strokeWidth={1.6} />
      <Path d="M151.5 176 Q156.5 168 161 176" fill="none" stroke={colors.onSurface} strokeWidth={1.6} />

      {/* plants */}
      <Path
        d="M48 196 Q42 182 48 168 M48 184 Q40 178 34 182 M48 178 Q56 172 60 176"
        fill="none"
        stroke={colors.outlineVariant}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Path
        d="M192 196 Q198 182 192 168 M192 184 Q200 178 206 182 M192 178 Q184 172 180 176"
        fill="none"
        stroke={colors.outlineVariant}
        strokeWidth={2.4}
        strokeLinecap="round"
      />

      <Path d="M104 202 L58 210 M136 202 L182 210" fill="none" stroke={colors.onSurface} strokeWidth={1.8} opacity={0.7} />
    </Svg>
  );
}

export function ShopNeedsIllustration({ size = VIEW }: Props) {
  const bubbleStroke = { stroke: colors.onSurface, strokeWidth: 1.8 };
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`}>
      <Circle cx={120} cy={120} r={86} fill="none" stroke={colors.outlineVariant} strokeWidth={2} strokeDasharray="5 7" />

      {/* cart bubble */}
      <Circle cx={52} cy={66} r={26} fill={colors.tertiaryContainer} {...bubbleStroke} />
      <Path
        d="M40 60 L46 60 L50 76 L64 76 L67 65 L44 65"
        fill="none"
        stroke={colors.surface}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={51} cy={80} r={2.4} fill={colors.surface} />
      <Circle cx={61} cy={80} r={2.4} fill={colors.surface} />

      {/* bottles bubble */}
      <Circle cx={188} cy={66} r={26} fill={colors.secondaryContainer} {...bubbleStroke} />
      <Rect x={180} y={54} width={8} height={20} rx={2} fill={colors.surface} />
      <Rect x={192} y={58} width={8} height={16} rx={2} fill={colors.surface} />

      {/* lotion bubble */}
      <Circle cx={52} cy={176} r={26} fill={colors.secondary} {...bubbleStroke} />
      <Rect x={44} y={168} width={14} height={20} rx={3} fill={colors.surface} />
      <Rect x={47} y={162} width={8} height={7} rx={2} fill={colors.surface} />

      {/* dress bubble */}
      <Circle cx={188} cy={176} r={26} fill={colors.primaryContainer} {...bubbleStroke} />
      <Path d="M188 162 L188 165" stroke={colors.surface} strokeWidth={1.6} />
      <Path d="M182 165 Q188 159 194 165" fill="none" stroke={colors.surface} strokeWidth={1.6} />
      <Path d="M182 166 L194 166 L191 172 L196 190 L180 190 L185 172 Z" fill={colors.surface} />

      {/* phone */}
      <Rect x={94} y={74} width={52} height={92} rx={12} fill={colors.primary} stroke={colors.onSurface} strokeWidth={2} />
      <Rect x={100} y={84} width={40} height={66} rx={4} fill={colors.surface} />
      <Rect x={105} y={90} width={13} height={13} rx={2} fill={colors.tertiaryContainer} />
      <Rect x={122} y={90} width={13} height={13} rx={2} fill={colors.secondaryContainer} />
      <Rect x={105} y={107} width={13} height={13} rx={2} fill={colors.primaryFixed} />
      <Rect x={122} y={107} width={13} height={13} rx={2} fill={colors.secondary} />
      <Rect x={105} y={124} width={13} height={13} rx={2} fill={colors.primaryContainer} />
      <Rect x={122} y={124} width={13} height={13} rx={2} fill={colors.tertiary} />
      <Circle cx={120} cy={158} r={3} fill={colors.primaryFixed} />
    </Svg>
  );
}

// Faithful to an earlier validated design (two overlapping same-fill
// shapes merging into one chassis silhouette, rather than one hand-drawn
// body path) - just recolored to this session's palette instead of
// reinventing the scooter shape. The chassis/front-blob fill is
// colors.surface (white), not colors.primary - the page background IS
// colors.primary, so a violet-on-violet fill would be invisible with
// nothing but its own outline doing the work.
export function FastDeliveryIllustration({ size = VIEW }: Props) {
  const stroke = { stroke: colors.onSurface, strokeWidth: 2.2 };
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`}>
      <Line x1={20} y1={200} x2={212} y2={200} stroke={colors.onSurface} strokeWidth={2} />

      {/* wheels */}
      <Circle cx={68} cy={176} r={22} fill={colors.onSurface} />
      <Circle cx={68} cy={176} r={9} fill={colors.surface} />
      <Circle cx={176} cy={176} r={22} fill={colors.onSurface} />
      <Circle cx={176} cy={176} r={9} fill={colors.surface} />

      {/* chassis + front blob (same fill, merge into one silhouette) */}
      <Rect x={48} y={140} width={144} height={36} rx={18} fill={colors.surface} {...stroke} />
      <Rect x={150} y={118} width={50} height={58} rx={24} fill={colors.surface} {...stroke} />

      {/* seat, bridging the chassis/front-blob join */}
      <Rect x={104} y={126} width={46} height={18} rx={9} fill={colors.onSurface} opacity={0.85} />

      {/* visor stripe */}
      <Rect x={160} y={132} width={30} height={10} rx={5} fill={colors.tertiaryContainer} />

      {/* handlebar, sitting right on top of the front blob */}
      <Rect x={188} y={98} width={8} height={24} rx={4} fill={colors.onSurface} />
      <Rect x={178} y={92} width={28} height={9} rx={4.5} fill={colors.onSurface} />

      {/* delivery box */}
      <Rect x={26} y={86} width={62} height={62} rx={12} fill={colors.tertiaryContainer} />
      <Rect x={38} y={102} width={38} height={8} rx={4} fill={colors.surface} opacity={0.75} />
      <Rect x={38} y={120} width={38} height={8} rx={4} fill={colors.surface} opacity={0.75} />
    </Svg>
  );
}
