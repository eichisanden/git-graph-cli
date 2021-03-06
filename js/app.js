$(() => {
  'use strict';
  let gitGraph;
  let branches = {};
  let history = [];
  let histCounter = 0;
  let checkoutBranch;
  const $cliResponse = $('#cli-response');
  const $branchName = $('#branch-name');
  const $saveButton = $('#save-button');
  const $template = $('#template');
  const $orientation = $('#orientation');
  const $mode = $('#mode');
  const $reverseArrow = $('#reverseArrow');
  const $author = $('#author');
  const $cliTxt = $('.cli-txt');

  $cliTxt.focus();
  changeSetting();

  $cliTxt.keyup((event) => {
    switch (event.which) {
      case 13: // return key
        cli($cliTxt.val());
        break;
      case 38: // up key
        console.log(`histCounter=${histCounter} history.length=${history.length}`);
        if (histCounter > 0 && histCounter <= history.length) {
          $cliTxt.val(history[--histCounter]);
        }
        break;
      case 40: // down key
        console.log(`histCounter=${histCounter} history.length=${history.length}`);
        if (histCounter < history.length) {
          $cliTxt.val(history[++histCounter]);
        }
        break;
    }
    
  });

  // save image
  $saveButton.click(() => {
    const canvas = document.getElementById('gitGraph');
    canvas.toBlob((blob) => {
      saveAs(blob, 'gitGraph.png');
    });
  });

  // change settings
  $template.change(changeSetting);
  $orientation.change(changeSetting);
  $mode.change(changeSetting);
  $reverseArrow.change(changeSetting);
  function changeSetting() {
    // new GitGraph Object
    gitGraph = new GitGraph({
      template: $template.val(),
      reverseArrow: $reverseArrow.prop('checked'),
      orientation: $orientation.val(),
      mode: $mode.val(),
      author: $author.val()
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
  }

  function cli(input) {
    out('');
    const args = input.split(/ +/);

    if (args.length <= 1 || args[0] != 'git') {
      out("git-graph-cli: invalid command. See 'help'.");
      return;
    }

    const option1 = args[1];
    switch (option1) {
      case 'commit':
        if (checkoutBranch === undefined) {
          out('git-graph-cli: no branch checkout.');
          return;
        }

        if (args[2] === '-m' && args.length >= 3) {
          const message = args[3];
          // commit with message without quoted charater.
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
          $cliTxt.val('');
          return;
        } else if (args.length == 3) {
            // make new branch
            const branchName = args[2];
            branches[branchName] = gitGraph.branch(branchName);
        } else if (args.length == 4) {
          const branchName = args[3];
          if (args[2] === '-d' || args[2] === '-D') {
            if (checkoutBranch === branchName) {
              out(`git-graph-cli: Cant't delete check outing branch.`);
              return;
            }
            // delete branch
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
        if (!(mergeBranch in branches)) {
          out(`git-graph-cli: Branch: ${mergeBranch} is not exist.`);
          return;
        }
        branches[mergeBranch].merge(branches[checkoutBranch]);
        break;

      default:
        out(`git-graph-cli: '${option1}' is not valid option. See 'help'.`);
        return;
    }
    save(input);
    $cliTxt.val('');
  }

  // output message.
  function out(message) {
    $cliResponse.html(message);
  }

  // save command history
  function save(command) {
    history.push(command);
    histCounter = history.length;
  }
});
