import { SurfaceUtil, ImageAsset } from "..";
import { Surface, Game, skeletonRuntime, customMatchers } from "./helpers";

describe("test SurfaceUtil", () => {
	it("asSurface", done => {
		expect.extend(customMatchers);
		const runtime = skeletonRuntime();
		const scene = runtime.scene;
		const surface = new Surface(1, 1);
		expect(SurfaceUtil.asSurface(surface)).toBe(surface);
		expect(SurfaceUtil.asSurface(undefined)).toBeUndefined();
		expect(() => {
			SurfaceUtil.asSurface(scene);
		}).toThrowError("TypeMismatchError");

		const game = new Game({
			width: 320,
			height: 270,
			assets: {
				foo: {
					type: "image",
					path: "/dummypath.png",
					virtualPath: "dummypath.png",
					global: true,
					width: 1,
					height: 1
				}
			}
		});
		game._loaded.add(() => {
			expect(SurfaceUtil.asSurface(game.assets.foo)).toEqual((game.assets.foo as ImageAsset).asSurface());
			done();
		});
		game._startLoadingGlobalAssets();
	});
});
