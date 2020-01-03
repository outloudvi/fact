var area = document.getElementById("divRefArea");
var chkBox = document.getElementById("chkAuto");

function buildFactElement(string) {
  let elm = document.createElement("span");
  elm.className = "fact";
  elm.innerText = string;
  return elm;
}

var buildTextElement = document.createTextNode.bind(document);

function isTextNode(node) {
  return node.nodeType === 3;
}

function getPartialNode(node) {
  if (isTextNode(node) && node.parentNode.className.includes("fact")) {
    return node.parentNode;
  }
  return node;
}

function isHighlightedNode(node) {
  let part = getPartialNode(node);
  return !isTextNode(part) && part.className.includes("fact");
}

function getTextNode(node) {
  if (node.nodeType === 1) {
    for (i of node.childNodes) {
      if (i.nodeType === 3) {
        return i;
      }
    }
  }
  return node;
}

function modifyNode(object, ...args) {
  console.log(
    "WAS",
    object.textContent,
    "NOW",
    args.map(x => x.textContent).reduce((a, b) => a + b)
  );
  object.replaceWith(...args.filter(x => x !== undefined));
}

function getChangeList(head, tail) {
  let initialTextNode = head;
  let nodeList = [];
  let hereNode = getPartialNode(initialTextNode);
  head = getTextNode(head);
  tail = getTextNode(tail);
  while (hereNode !== null) {
    nodeList.push(hereNode);
    if (getTextNode(hereNode) === tail) break;
    hereNode = hereNode.nextSibling;
  }
  return nodeList;
}

function commitChange() {
  let sel = window.getSelection();
  if (sel.rangeCount < 1) return;
  let range = sel.getRangeAt(0);
  if (range.toString() === "") {
    return;
  }

  let nodeList = [];

  let head = range.startContainer;
  if (head.tagName === "DIV") {
    nodeList = getChangeList(
      head.childNodes[0],
      head.childNodes[head.childNodes.length - 1]
    );
  } else {
    nodeList = getChangeList(range.startContainer, range.endContainer);
  }

  console.log(
    "NLS",
    nodeList.map(x => x.textContent)
  );

  for (let currNode of nodeList) {
    let p1, p2, p3;

    let textNode = getTextNode(currNode);
    if (textNode === undefined) continue;

    let highlight = !isHighlightedNode(currNode);

    if (textNode === range.startContainer && textNode === range.endContainer) {
      // if start and end at the same container
      p1 = textNode.textContent.slice(0, range.startOffset);
      p2 = textNode.textContent.slice(range.startOffset, range.endOffset);
      p3 = textNode.textContent.slice(range.endOffset);
      if (highlight) {
        modifyNode(
          currNode,
          buildTextElement(p1),
          buildFactElement(p2),
          buildTextElement(p3)
        );
      } else {
        modifyNode(
          currNode,
          buildFactElement(p1),
          buildTextElement(p2),
          buildFactElement(p3)
        );
      }
    } else if (textNode === range.startContainer) {
      p1 = textNode.textContent.slice(0, range.startOffset);
      p2 = textNode.textContent.slice(range.startOffset);
      if (highlight) {
        modifyNode(currNode, buildTextElement(p1), buildFactElement(p2));
      } else {
        modifyNode(currNode, buildFactElement(p1), buildTextElement(p2));
      }
    } else if (textNode === range.endContainer) {
      p1 = textNode.textContent.slice(0, range.endOffset);
      p2 = textNode.textContent.slice(range.endOffset);
      if (highlight) {
        modifyNode(currNode, buildFactElement(p1), document.createTextNode(p2));
      } else {
        modifyNode(currNode, buildTextElement(p1), buildFactElement(p2));
      }
    } else {
      if (highlight) {
        modifyNode(currNode, buildFactElement(textNode.textContent));
      } else {
        modifyNode(currNode, buildTextElement(textNode.textContent));
      }
    }
  }
  sel.removeAllRanges();

  // Cleaning up
  let deletionList = [];
  for (const [index, item] of area.childNodes.entries()) {
    if (index > 0) {
      // Step 1: Merge .fact units
      if (
        isHighlightedNode(item) &&
        isHighlightedNode(area.childNodes[index - 1])
      ) {
        item.textContent =
          area.childNodes[index - 1].textContent + item.textContent;
        area.childNodes[index - 1].textContent = "";
        deletionList.push(index - 1);
      }

      // Step 2: Merge text units
      if (
        !isHighlightedNode(item) &&
        !isHighlightedNode(area.childNodes[index - 1])
      ) {
        item.textContent =
          area.childNodes[index - 1].textContent + item.textContent;
        area.childNodes[index - 1].textContent = "";
        deletionList.push(index - 1);
      }
    }

    // Step 3: Remove empty node
    if (item.textContent === "") deletionList.push(index);
  }

  for (let i = deletionList.length - 1; i >= 0; i--) {
    area.childNodes[deletionList[i]].remove();
  }
}

// Listeners

document.getElementById("btnReset").addEventListener("click", evt => {
  evt.preventDefault();
  area.textContent = area.textContent;
});

document.getElementById("btnMark").addEventListener("click", evt => {
  evt.preventDefault();
  commitChange();
});

window.addEventListener("mouseup", () => {
  if (chkBox.checked) commitChange();
});

chkBox.addEventListener("change", () => {
  document.getElementById("pCmdA").style.display = chkBox.checked
    ? "block"
    : "none";
  document.getElementById("pCmdB").style.display = chkBox.checked
    ? "none"
    : "block";
  document.getElementById("btnMark").disabled = chkBox.checked;
});
