(function (global) {
  "use strict";

  var stages = [
    [0, "わかば", "growth-00-wakaba.png", "sprout"],
    [5000, "つぼみ", "growth-01-tsubomi.png", "bud"],
    [10000, "あさがお", "growth-02-asagao.png", "flower"],
    [20000, "ひまわり", "growth-03-himawari.png", "flower"],
    [30000, "たんぽぽ", "growth-04-tanpopo.png", "flower"],
    [40000, "すみれ", "growth-05-sumire.png", "flower"],
    [50000, "つばき", "growth-06-tsubaki.png", "flower"],
    [60000, "あじさい", "growth-07-ajisai.png", "flower"],
    [70000, "ゆり", "growth-08-yuri.png", "flower"],
    [80000, "ばら", "growth-09-bara.png", "flower"],
    [90000, "らん", "growth-10-ran.png", "flower"],
    [100000, "さくら", "growth-11-sakura.png", "flower-tree"],
    [110000, "はなみずき", "growth-12-hanamizuki.png", "flower-tree"],
    [120000, "うめ", "growth-13-ume.png", "tree"],
    [130000, "もみじ", "growth-14-momiji.png", "tree"],
    [140000, "けやき", "growth-15-keyaki.png", "tree"],
    [150000, "いちょう", "growth-16-icho.png", "tree"],
    [200000, "くすのき", "growth-17-kusunoki.png", "tree"],
    [250000, "まつ", "growth-18-matsu.png", "tree"],
    [300000, "ひのき", "growth-19-hinoki.png", "tree"],
    [500000, "せこいあ", "growth-20-sequoia.png", "tree"],
    [750000, "ガジュマル", "growth-21-gajumaru.png", "great-tree"],
    [1000000, "縄文杉", "growth-22-jomon-sugi.png", "great-tree"],
    [5000000, "木遁・樹海降誕", "growth-23-mokuton-jukai-kotan.png", "legendary-tree"],
    [10000000, "ユグドラシル", "growth-24-yggdrasil.png", "mythic-tree"]
  ].map(function (stage) {
    return Object.freeze({
      threshold: stage[0],
      name: stage[1],
      asset: "./output/imagegen/growth/" + stage[2],
      kind: stage[3]
    });
  });

  function validateStages() {
    for (var index = 1; index < stages.length; index += 1) {
      if (stages[index].threshold <= stages[index - 1].threshold) {
        throw new Error("Growth stage thresholds must be ascending and unique.");
      }
    }
    return true;
  }

  function normalizeTotal(total) {
    var value = Number(total);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function getStage(total) {
    var value = normalizeTotal(total);
    for (var index = stages.length - 1; index >= 0; index -= 1) {
      if (value >= stages[index].threshold) {
        return stages[index];
      }
    }
    return stages[0];
  }

  function getNextStage(total) {
    var value = normalizeTotal(total);
    for (var index = 0; index < stages.length; index += 1) {
      if (value < stages[index].threshold) {
        return stages[index];
      }
    }
    return null;
  }

  function getProgress(total) {
    var value = normalizeTotal(total);
    var current = getStage(value);
    var next = getNextStage(value);

    if (!next) {
      return { current: current, next: null, remaining: 0, ratio: 1 };
    }

    var span = next.threshold - current.threshold;
    return {
      current: current,
      next: next,
      remaining: next.threshold - value,
      ratio: (value - current.threshold) / span
    };
  }

  validateStages();

  global.GOSA_GROWTH_STAGES = Object.freeze(stages.slice());
  global.GosaGrowth = Object.freeze({
    getStage: getStage,
    getNextStage: getNextStage,
    getProgress: getProgress,
    validateStages: validateStages
  });
})(typeof window !== "undefined" ? window : globalThis);
