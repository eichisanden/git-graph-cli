$(() => {
  'use strict';
  const gitGraph = new GitGraph();
  const branches = {};
  let checkoutBranch;
  const $cliResponse = $('#cli-response');
  const $branchName = $('#branch-name');

  function cli(input) {
    $cliResponse.text('');
    const args = input.split(/ +/);

    if (args.length <= 1 || args[0] != 'git') {
      $cliResponse.html("git-graph-cli: invalid command. See 'help'.");
      return;
    }

    switch (args[1]) {
      case 'commit':
        if (checkoutBranch == undefined) {
          $cliResponse.html('git-graph-cli: no branch checkout.');
          return;
        }

        if (args[2] == '-m' && args.length >= 3) {
          const message = args[3];
          // commit with message without qutote charater.
          gitGraph.commit(message.replace(/^['"]|['"]$/g, ''));
        } else {
          // commit without message.
          gitGraph.commit();
        }
        break;

      case 'branch':
        // show branch list
        if (args.length == 2) {
          let response = '';
          Object.keys(branches).forEach((b) => {
            if (b == checkoutBranch) {
              response = `${response}<div>*&nbsp;${b}</div>`;
            } else {
              response = `${response}<div>&nbsp;&nbsp;${b}</div>`;
            }
          });
          $cliResponse.html(response || 'git-graph-cli: there is no branch.');
        // make new branch
        } else {
          const newBranchName = args[2];
          branches[newBranchName] = gitGraph.branch(newBranchName);
        }
        break;

      case 'checkout':
        if (args[2] == '-b' && args.length >= 3) {
          const newBranchName = args[3];
          // Already exist branch in branch list
          if (newBranchName in branches) {
            $cliResponse.html(`git-graph-cli: Branch: ${newBranchName} is already exist.`);
            return;
          // Add branch and checkout.
          } else {
            branches[newBranchName] = gitGraph.branch(newBranchName);
            checkoutBranch = newBranchName;
            $branchName.text(checkoutBranch);
          }
        } else {
          const branchName = args[2];
          if (!(branchName in branches)) {
            $cliResponse.html(`git-graph-cli: Branch: ${branchName} is not exist.`);
            return;
          }
          checkoutBranch = branchName;
          gitGraph.HEAD = branches[branchName];
          $branchName.text(checkoutBranch);
        }
        break;

      case 'merge':
        const mergeBranch = args[2];
        branches[mergeBranch].merge(branches[checkoutBranch]);
        break;

      default:
        $cliResponse.text(`git-graph-cli: '${args[1]}' is not valid option. See 'help'.`);
        return;
    }
    $('#cli-txt').val('');
  }

  const $cliTxt = $('.cli-txt');
  $cliTxt.focus();

  // return key event.
  $cliTxt.keypress((event) => {
    if (event.which == 13) {
      cli($cliTxt.val());
    }
  });

});
