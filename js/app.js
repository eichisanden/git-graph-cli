'use strict';

$(() => {
  let $cliTxt = $(".cli-txt");
  $cliTxt.focus();

  $cliTxt.keypress((event) => {
    if (event.which == 13) {
      cli($cliTxt.val());
    }
  });
});

let head = new GitGraph();
let branches = {};
let branch;

function cli(input) {
    let args = input.split(/ +/);
    switch (args[1]) {
      case 'commit':
        head.commit();
        break;
      case 'branch':
        branch = args[2];
        $("#branch-name").text(branch);
        branches[branch] = head.branch(branch);
        break;
      case 'checkout':
        if (branches[args[2]] == undefined) {
          alert(`branch: ${args[2]} is not exist`);
          return;
        }
        branch = args[2];
        $("#branch-name").text(branch);
        break;
      case 'merge':
        let mergeBranch = args[2];
        branches[mergeBranch].merge(branches[branch]);
        break;
    }
}
