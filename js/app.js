$(() => {
  'use strict';
  let gitGraph = new GitGraph({
      template: $('#template').val(),
      reverseArrow: false,
      orientation: $('#orientation').val(),
      mode: $('#mode').val(),
      author: $('#author').val()
  });
  let branches = {};
  let history = [];
  let checkoutBranch;
  const $cliResponse = $('#cli-response');
  const $branchName = $('#branch-name');
  const $chagenButton = $('#change-button');

  function cli(input) {
      out('');
    const args = input.split(/ +/);

    if (args.length <= 1 || args[0] != 'git') {
      out("git-graph-cli: invalid command. See 'help'.");
      return;
    }

    switch (args[1]) {
      case 'commit':
        if (checkoutBranch == undefined) {
          out('git-graph-cli: no branch checkout.');
          return;
        }

        if (args[2] === '-m' && args.length >= 3) {
          const message = args[3];
          // commit with message without qutote charater.
          gitGraph.commit(message.replace(/^['"]|['"]$/g, ''));
        } else {
          // commit without message.
          gitGraph.commit(' ');
        }
        break;

      case 'branch':
        if (args.length === 2) {
          // show branch list
          let response = '';
          Object.keys(branches).forEach((b) => {
            if (b === checkoutBranch) {
              response = `${response}<div>*&nbsp;${b}</div>`;
            } else {
              response = `${response}<div>&nbsp;&nbsp;${b}</div>`;
            }
          });
          out(response || 'git-graph-cli: there is no branch.');
        } else if (args.length == 3) {
            // make new branch
            const branchName = args[2];
            branches[branchName] = gitGraph.branch(branchName);
        } else if (args.length == 4) {
          if (args[2] === '-d' || args[2] === '-D') {
            if (checkoutBranch === args[3]) {
              out(`git-graph-cli: Cant't delete check outing branch.`);
              return;
            }
            // delete branch
            const branchName = args[3];
            if (branchName in branches) {
              branches[branchName].delete();
              delete branches[branchName];
            } else {
              out(`git-graph-cli: Branch:${branchName} not exits.`);
            }
          } else {
              out(`git-graph-cli: Invalid option.`);
              return;
          }
        }
        break;

      case 'checkout':
        if (args[2] === '-b' && args.length >= 3) {
          const newBranchName = args[3];
          // Already exist branch in branch list
          if (newBranchName in branches) {
            out(`git-graph-cli: Branch: ${newBranchName} is already exist.`);
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
            out(`git-graph-cli: Branch: ${branchName} is not exist.`);
            return;
          }
          checkoutBranch = branchName;
          branches[branchName].checkout();
          $branchName.text(checkoutBranch);
        }
        break;

      case 'merge':
        const mergeBranch = args[2];
        branches[mergeBranch].merge(branches[checkoutBranch]);
        break;

      default:
        out(`git-graph-cli: '${args[1]}' is not valid option. See 'help'.`);
        return;
    }
    save(input);
    $('#cli-txt').val('');
  }

  const $cliTxt = $('.cli-txt');
  $cliTxt.focus();

  // return key event.
  $cliTxt.keypress((event) => {
    if (event.which === 13) {
      cli($cliTxt.val());
    }
  });

  // change settings
  $chagenButton.click(() => {
    // new GitGraph Object
    gitGraph = new GitGraph({
      template: $('#template').val(),
      reverseArrow: false,
      orientation: $('#orientation').val(),
      mode: $('#mode').val(),
      author: $('#author').val()
    });

    // clear canvas
    gitGraph.render();

    // clear branches
    branches = {};
    checkoutBranch = undefined;
    const historyCopy = history.slice(0);
    history = [];

    // restore canvas
    for (let command of historyCopy) {
      cli(command);
    }
  });

  // output message.
  function out(message) {
    $cliResponse.text(message);
  }

  // save command history
  function save(command) {
    history.push(command);
  }
});
