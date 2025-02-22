// forest.js
let forestCount = 100; // denser forest
let forestTrees = [];

function initForest(W, H) {
  forestTrees = [];
  for (let i = 0; i < forestCount; i++){
    forestTrees.push({
      x: Math.random() * W,
      isBig: (Math.random() > 0.5)
    });
  }
}

function drawForest(ctx, W, H){
  const horizon = 0.75 * H;
  forestTrees.forEach(t => {
    const trunkH  = t.isBig ? 5 : 3;
    const leavesH = t.isBig ? 4 : 2;

    ctx.fillStyle = 'rgb(20,60,20)'; // silhouette color

    // trunk
    ctx.fillRect(t.x, horizon - trunkH, 1, trunkH);

    // leaves
    ctx.fillRect(t.x - 1, horizon - trunkH - leavesH, 3, leavesH);
  });
}
