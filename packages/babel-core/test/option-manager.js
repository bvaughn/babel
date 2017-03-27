import assert from "assert";
import OptionManager from "../lib/config/option-manager";
import path from "path";

describe("option-manager", () => {
  describe("memoisePluginContainer", () => {
    it("throws for babel 5 plugin", () => {
      return assert.throws(
        () =>
          OptionManager.memoisePluginContainer(
            ({ Plugin }) => new Plugin("object-assign", {}),
          ),
        /Babel 5 plugin is being run with Babel 6/,
      );
    });
  });

  describe("mergeOptions", () => {
    it("throws for removed babel 5 options", () => {
      return assert.throws(
        () => {
          const opt = new OptionManager();
          opt.init({
            randomOption: true,
          });
        },
        /Unknown option: base.randomOption/,
      );
    });

    it("throws for removed babel 5 options", () => {
      return assert.throws(
        () => {
          const opt = new OptionManager();
          opt.init({
            auxiliaryComment: true,
            blacklist: true,
          });
        },
        // eslint-disable-next-line max-len
        /Using removed Babel 5 option: base.auxiliaryComment - Use `auxiliaryCommentBefore` or `auxiliaryCommentAfter`/,
      );
    });

    it("throws for resolved but erroring preset", () => {
      return assert.throws(
        () => {
          const opt = new OptionManager();
          opt.init({
            presets: [
              path.join(__dirname, "fixtures/option-manager/not-a-preset"),
            ],
          });
        },
        /While processing preset: .*option-manager(?:\/|\\\\)not-a-preset\.js/,
      );
    });
  });

  describe("presets", function() {
    function presetTest(name) {
      it(name, function() {
        const opt = new OptionManager();
        const options = opt.init({
          presets: [
            path.join(__dirname, "fixtures/option-manager/presets", name),
          ],
        });

        assert.equal(true, Array.isArray(options.plugins));
        assert.equal(1, options.plugins.length);
      });
    }

    function presetThrowsTest(name, msg) {
      it(name, function() {
        const opt = new OptionManager();
        assert.throws(
          () =>
            opt.init({
              presets: [
                path.join(__dirname, "fixtures/option-manager/presets", name),
              ],
            }),
          msg,
        );
      });
    }

    presetTest("es5_function");
    presetTest("es5_object");
    presetTest("es2015_default_function");
    presetTest("es2015_default_object");

    presetThrowsTest(
      "es2015_named",
      /Preset must export a default export when using ES6 modules/,
    );
    presetThrowsTest("es2015_invalid", /Unsupported preset format: string/);
    presetThrowsTest("es5_invalid", /Unsupported preset format: string/);
  });
});
