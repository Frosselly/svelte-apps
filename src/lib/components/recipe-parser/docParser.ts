import mammoth from 'mammoth';

export async function docToHTML(file: File) {
	try {
		const arrayBuffer = await file.arrayBuffer();
		const mammothResult = await mammoth.convertToHtml({
			buffer: Buffer.from(arrayBuffer)
		});
		if (!mammothResult) return;
		for (const message of mammothResult.messages) {
			console.warn(message.message);
		}
		return mammothResult.value;
	} catch (e) {
		console.error(e);
	}
}

/*

  returns: value: string, messages: {message: string; type: string}[]
*/
/**
 * Parses doc using mammoth returns: value: string, messages: {message: string; type: string}[]
 *
 * @return value: string
 * @return  messages: {message: string; type: string}[]
 */
async function handleFileSelect(arrayBuffer: ArrayBuffer) {
	try {
		const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
		return result;
	} catch (e) {
		console.error(e);
	}
}

//could be used
function readFileInputEventAsArrayBuffer(event, callback) {
	var file = event.target.files[0];

	var reader = new FileReader();

	reader.onload = function (loadEvent) {
		var arrayBuffer = loadEvent.target.result;
		callback(arrayBuffer);
	};

	reader.readAsArrayBuffer(file);
}

function displayResult(result) {
	document.getElementById('output').innerHTML = result.value;

	var messageHtml = result.messages
		.map(function (message) {
			return (
				'<li class="' +
				message.type +
				'">' +
				escapeHtml(message.message) +
				'</li>'
			);
		})
		.join('');

	document.getElementById('messages').innerHTML =
		'<ul>' + messageHtml + '</ul>';
}

function escapeHtml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
