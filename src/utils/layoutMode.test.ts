import { getLayoutMode, shouldUseWedgeCorners, SMALL_VIEWPORT_MAX_SIDE, TINY_VIEWPORT_MAX_SIDE } from './layoutMode';

describe('getLayoutMode', () => {
    const small = SMALL_VIEWPORT_MAX_SIDE - 80;
    const large = SMALL_VIEWPORT_MAX_SIDE + 320;

    it('uses the compact layout on a square viewport of any size by default', () => {
        expect(getLayoutMode({ width: small, height: small, compactOnlyOnSmallViewports: false })).toBe('compact');
        expect(getLayoutMode({ width: large, height: large, compactOnlyOnSmallViewports: false })).toBe('compact');
    });

    it('restricts the compact layout to small viewports when asked to', () => {
        expect(getLayoutMode({ width: small, height: small, compactOnlyOnSmallViewports: true })).toBe('compact');
        expect(getLayoutMode({ width: large, height: large, compactOnlyOnSmallViewports: true })).toBe('vertical');
    });

    it('falls back to the width-driven layouts outside the square range', () => {
        expect(getLayoutMode({ width: 1200, height: 600, compactOnlyOnSmallViewports: false })).toBe('horizontal');
        expect(getLayoutMode({ width: 600, height: 1200, compactOnlyOnSmallViewports: false })).toBe('vertical');
    });

    it('keeps the square range inclusive at its edges', () => {
        expect(getLayoutMode({ width: 800, height: 1000, compactOnlyOnSmallViewports: false })).toBe('compact');
        expect(getLayoutMode({ width: 1000, height: 800, compactOnlyOnSmallViewports: false })).toBe('compact');
        expect(getLayoutMode({ width: 1000, height: 780, compactOnlyOnSmallViewports: false })).toBe('horizontal');
    });

    it('keeps the small-viewport threshold inclusive', () => {
        const side = SMALL_VIEWPORT_MAX_SIDE;
        expect(getLayoutMode({ width: side, height: side, compactOnlyOnSmallViewports: true })).toBe('compact');
        expect(getLayoutMode({ width: side + 1, height: side + 1, compactOnlyOnSmallViewports: true })).toBe(
            'vertical'
        );
    });

    describe('with a side narrower than an eighth of a 1920px screen', () => {
        const tiny = TINY_VIEWPORT_MAX_SIDE;

        it('forces the compact layout however stretched the viewport is', () => {
            expect(getLayoutMode({ width: 1200, height: tiny, compactOnlyOnSmallViewports: false })).toBe('compact');
            expect(getLayoutMode({ width: tiny, height: 1200, compactOnlyOnSmallViewports: false })).toBe('compact');
        });

        it('checks width and height independently', () => {
            expect(getLayoutMode({ width: tiny + 1, height: 1200, compactOnlyOnSmallViewports: false })).toBe(
                'vertical'
            );
            expect(getLayoutMode({ width: 1200, height: tiny + 1, compactOnlyOnSmallViewports: false })).toBe(
                'horizontal'
            );
        });

        it('ignores the small-windows-only setting, which would otherwise rule the compact layout out', () => {
            expect(getLayoutMode({ width: 1200, height: tiny, compactOnlyOnSmallViewports: true })).toBe('compact');
        });
    });
});

describe('shouldUseWedgeCorners', () => {
    it('keeps round buttons while they clear the dial', () => {
        expect(shouldUseWedgeCorners({ width: 520, height: 520 })).toBe(false);
        expect(shouldUseWedgeCorners({ width: 900, height: 900 })).toBe(false);
    });

    it('switches to wedges once the buttons would reach into the dial', () => {
        expect(shouldUseWedgeCorners({ width: 480, height: 480 })).toBe(true);
        expect(shouldUseWedgeCorners({ width: 320, height: 320 })).toBe(true);
        expect(shouldUseWedgeCorners({ width: 260, height: 260 })).toBe(true);
    });

    it('keeps round buttons on a stretched viewport, where the corners are far from the dial', () => {
        // The dial is sized by the short side, so wide-but-short windows have roomy corners.
        expect(shouldUseWedgeCorners({ width: 1200, height: 240 })).toBe(false);
    });
});
